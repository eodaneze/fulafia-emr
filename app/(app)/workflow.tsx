import { ModulePreviewScreen } from '@/src/components';

export default function WorkflowScreen() {
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