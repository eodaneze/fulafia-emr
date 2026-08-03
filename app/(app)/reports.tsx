import { ModulePreviewScreen } from '@/src/components';

export default function ReportsScreen() {
  return (
    <ModulePreviewScreen
      description="Monitor hospital performance and generate operational reports for management."
      eyebrow="REPORTING AND ANALYTICS"
      features={[
        {
          title: 'Patient reports',
          description:
            'Daily and monthly patient attendance and visit statistics.',
          icon: 'people-outline',
        },
        {
          title: 'Clinical performance',
          description:
            'Doctor workload, waiting times and laboratory turnaround.',
          icon: 'pulse-outline',
        },
        {
          title: 'Pharmacy consumption',
          description:
            'Medication dispensing and stock-utilization reports.',
          icon: 'bandage-outline',
        },
        {
          title: 'Export reports',
          description:
            'Prepare reports for PDF and spreadsheet export.',
          icon: 'download-outline',
        },
      ]}
      title="Reports"
    />
  );
}