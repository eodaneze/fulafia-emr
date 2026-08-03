import { Redirect } from 'expo-router';

import { ModulePreviewScreen } from '@/src/components';
import { useAuthStore } from '@/src/store/auth.store';

export default function WorkflowScreen() {
  const user = useAuthStore((state) => state.user);

  if (
    user?.role === 'outpatient_nurse' ||
    user?.role === 'ward_nurse'
  ) {
    return <Redirect href="/nursing" />;
  }

  if (user?.role === 'doctor') {
    return <Redirect href="/doctor" />;
  }

  return (
    <ModulePreviewScreen
      description="Follow the patient from registration through nursing, doctor review, laboratory, pharmacy and discharge."
      eyebrow="CONTINUOUS CARE LOOP"
      features={[
        {
          title: 'Records and nursing',
          description:
            'Registration and vital signs automatically move the patient to the doctor queue.',
          icon: 'medkit-outline',
        },
        {
          title: 'Doctor case ownership',
          description:
            'The assigned doctor remains responsible for the clinical case until discharge.',
          icon: 'medical-outline',
        },
        {
          title: 'Laboratory feedback',
          description:
            'Completed results return automatically to the requesting doctor.',
          icon: 'flask-outline',
        },
        {
          title: 'Pharmacy and discharge',
          description:
            'Dispensing status returns to the doctor before the case is completed.',
          icon: 'bandage-outline',
        },
      ]}
      title="Clinical workflow"
    />
  );
}