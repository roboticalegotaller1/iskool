import { redirect } from 'next/navigation';

/**
 * Redirección canónica a la Consola Principal de Gobernanza de IBIME.
 */
export default function IbimeRootPage() {
  redirect('/ibime/portal');
}
