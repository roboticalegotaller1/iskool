-- Migración: Transacciones Atómicas (ACID) y Anti-Cheat en la Store
-- Database: PostgreSQL (Supabase)

-- 1. Fortificación de la función purchase_artifact con bloqueo exclusivo de fila (FOR UPDATE)
create or replace function public.purchase_artifact(
  p_student_id uuid,
  p_artifact_id text
)
returns jsonb
language plpgsql
security definer
SET search_path = public, pg_catalog, pg_temp
as $$
declare
  v_coins integer;
  v_price integer;
  v_name text;
  v_message_id uuid;
  v_message_text text;
  v_inventory text[];
begin
  -- 1. Obtener detalles del artefacto
  select price, name
  into v_price, v_name
  from public.shop_artifacts
  where id = p_artifact_id;

  if not found then
    raise exception 'Artifact % not found in shop', p_artifact_id;
  end if;

  -- 2. Bloqueo de fila exclusivo (FOR UPDATE) para prevenir Race Conditions por clics rápidos concurrentes
  select coins
  into v_coins
  from public.student_stats
  where student_id = p_student_id
  for update;

  if not found then
    raise exception 'Student stats for % not found', p_student_id;
  end if;

  -- 3. Validación atómica de fondos suficientes
  if v_coins < v_price then
    raise exception 'Insufficient coins. Required: %, Available: %', v_price, v_coins;
  end if;

  -- 4. Validación de pertenencia previa (unicidad en inventario)
  if exists (
    select 1 from public.student_inventory
    where student_id = p_student_id and artifact_id = p_artifact_id
  ) then
    raise exception 'Student already owns artifact %', p_artifact_id;
  end if;

  -- 5. Descuento atómico de monedas
  v_coins := v_coins - v_price;
  update public.student_stats
  set coins = v_coins,
      updated_at = now()
  where student_id = p_student_id;

  -- 6. Inserción atómica en inventario
  insert into public.student_inventory (student_id, artifact_id, acquired_at)
  values (p_student_id, p_artifact_id, now());

  -- 7. Registro de alerta de compra en mensajería
  v_message_text := 'Has comprado el artefacto "' || v_name || '" por ' || v_price || ' monedas escolares.';
  insert into public.student_messages (student_id, title, message, is_read, type, sent_at)
  values (p_student_id, '🎁 Compra de Artefacto', v_message_text, false, 'purchase', now())
  returning id into v_message_id;

  -- 8. Obtención de inventario consolidado
  select array_agg(artifact_id) into v_inventory
  from public.student_inventory
  where student_id = p_student_id;

  return jsonb_build_object(
    'success', true,
    'new_coins', v_coins,
    'inventory', coalesce(v_inventory, array[]::text[]),
    'new_message', jsonb_build_object(
      'id', v_message_id,
      'student_id', p_student_id,
      'title', '🎁 Compra de Artefacto',
      'message', v_message_text,
      'sent_at', now(),
      'is_read', false
    )
  );
end;
$$;
