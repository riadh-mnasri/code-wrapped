// © 2026 Riadh MNASRI
import Story from "@/components/Story";
import data from "@/data/wrapped.json";
import type { Wrapped } from "@/lib/types";

export default function Home() {
  return <Story data={data as Wrapped} />;
}
