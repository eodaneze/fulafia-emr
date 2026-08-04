import {
  Redirect,
  type Href,
} from 'expo-router';

export default function CreateStaffRoute() {
  return <Redirect href={'/hr' as Href} />;
}