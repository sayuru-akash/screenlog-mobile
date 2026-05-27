import { useLocalSearchParams } from "expo-router";
import { TitleDetailView } from "@/components/content/TitleDetailView";

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TitleDetailView type="movie" id={id} />;
}
