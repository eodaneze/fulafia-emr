import { ModulePreviewScreen } from '@/src/components';

export default function SettingsScreen() {
  return (
    <ModulePreviewScreen
      description="Control account preferences, device configuration and local server connectivity."
      eyebrow="APPLICATION SETTINGS"
      features={[
        {
          title: 'Profile and security',
          description:
            'Manage account details, password and session security.',
          icon: 'shield-checkmark-outline',
        },
        {
          title: 'Hospital server',
          description:
            'Review or change the local network server configuration.',
          icon: 'server-outline',
        },
        {
          title: 'Device registration',
          description:
            'View the device name, access status and assigned department.',
          icon: 'phone-portrait-outline',
        },
        {
          title: 'Display preferences',
          description:
            'Control text size, accessibility and application appearance.',
          icon: 'options-outline',
        },
      ]}
      title="Settings"
    />
  );
}