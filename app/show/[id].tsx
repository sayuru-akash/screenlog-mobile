import { useLocalSearchParams } from "expo-router";
import { TitleDetailView } from "@/components/content/TitleDetailView";

export default function ShowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TitleDetailView type="show" id={id} />;
}
