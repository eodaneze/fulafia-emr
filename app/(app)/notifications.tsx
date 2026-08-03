import { ModulePreviewScreen } from '@/src/components';

export default function NotificationsScreen() {
  return (
    <ModulePreviewScreen
      description="Receive live operational and clinical updates from every connected department."
      eyebrow="REAL-TIME UPDATES"
      features={[
        {
          title: 'New patient assigned',
          description:
            'Doctors receive immediate notice when a patient enters their queue.',
          icon: 'person-add-outline',
        },
        {
          title: 'Laboratory result ready',
          description:
            'The requesting doctor is notified when results are completed.',
          icon: 'flask-outline',
        },
        {
          title: 'Medication dispensed',
          description:
            'Pharmacy status is written back to the clinical case.',
          icon: 'checkmark-circle-outline',
        },
        {
          title: 'Equipment maintenance',
          description:
            'Management receives scheduled servicing reminders.',
          icon: 'construct-outline',
        },
      ]}
      title="Notifications"
    />
  );
}