import { ModulePreviewScreen } from '@/src/components';

export default function PatientsScreen() {
  return (
    <ModulePreviewScreen
      description="Search, register and manage every patient from one secure electronic record."
      eyebrow="PATIENT MANAGEMENT"
      features={[
        {
          title: 'Search patients',
          description:
            'Find patients using hospital number, student registration number, name or phone number.',
          icon: 'search-outline',
        },
        {
          title: 'Register new patient',
          description:
            'Capture demographics and generate a unique hospital number.',
          icon: 'person-add-outline',
        },
        {
          title: 'Visit history',
          description:
            'Review previous consultations, diagnoses and treatments.',
          icon: 'time-outline',
        },
        {
          title: 'Print patient card',
          description:
            'Generate a patient identity card for hospital use.',
          icon: 'card-outline',
        },
      ]}
      title="Patient records"
    />
  );
}