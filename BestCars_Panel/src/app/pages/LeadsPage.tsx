import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { usePanelDataContext } from "../../contexts/PanelDataContext";
import { LeadsSection } from "../components/leads-section";
import { LeadsSkeleton } from "../components/leads-skeleton";

export default function LeadsPage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const { vehicles, leads, loading, handleLeadUpdate, handleLeadDelete } = usePanelDataContext();

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLeads = useMemo(() => {
    if (!normalizedQuery) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(normalizedQuery) ||
        l.email.toLowerCase().includes(normalizedQuery) ||
        l.phone.toLowerCase().includes(normalizedQuery)
    );
  }, [leads, normalizedQuery]);

  if (loading) return <LeadsSkeleton />;

  return (
    <LeadsSection
      leads={filteredLeads}
      vehicles={vehicles}
      onLeadUpdate={handleLeadUpdate}
      onLeadDelete={handleLeadDelete}
    />
  );
}
