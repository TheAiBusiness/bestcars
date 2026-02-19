interface DescriptionSectionProps {
  description?: string;
}

export function DescriptionSection({ description }: DescriptionSectionProps) {
  return (
    <article className="mt-6 rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[.06] shadow-xl shadow-black/20 backdrop-blur-sm p-8">
      <h2 className="m-0 mb-4 text-xl font-black text-white">Descripción</h2>
      <p className="text-white/60 font-normal leading-relaxed text-[15px] m-0">
        {description || 'No hay descripción disponible para este vehículo.'}
      </p>
    </article>
  );
}