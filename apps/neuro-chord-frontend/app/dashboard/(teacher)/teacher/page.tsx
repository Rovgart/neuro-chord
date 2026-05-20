import { getMyMaterials } from '@/features/auth/services/materials-server';
import { getServerAuth } from '@/features/auth/services/server-role-auth';
import MaterialsList from '@/features/dashboard/components/materials/Materials';
import MaterialsHydrator from '@/features/dashboard/components/materials/MaterialsHydrator';

async function Page() {
  const session = await getServerAuth();
  const materials = session ? await getMyMaterials(session.token) : null;
  return (
    <div>
      <MaterialsHydrator data={materials} />
      <MaterialsList />
    </div>
  );
}

export default Page;
