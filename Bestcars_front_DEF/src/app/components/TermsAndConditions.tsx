import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import "./TermsAndConditions.css";

interface TermsAndConditionsProps {
  isStockMenuOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TermsAndConditions({ isStockMenuOpen = false, onOpenChange }: TermsAndConditionsProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <>
      {!isStockMenuOpen && (
        <button
          type="button"
          className="terms-trigger rounded-sm"
          aria-label="Ver Términos y Condiciones"
          onClick={() => handleOpenChange(true)}
        >
          Términos y Condiciones
        </button>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="terms-dialog-content">
          {/* Noise texture overlay */}
          <div
            className="terms-noise-overlay"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }}
          />
          <DialogHeader>
            <DialogTitle className="terms-title">
              Términos y Condiciones
            </DialogTitle>
            <DialogDescription className="sr-only">
              Términos y condiciones de uso del sitio web de Best Cars Ibérica. Última actualización: Febrero 2026.
            </DialogDescription>
          </DialogHeader>
          <div className="terms-scroll">
              <div className="terms-text">
                <h2 className="terms-main-heading">TÉRMINOS Y CONDICIONES DE USO</h2>
                <p className="terms-date">Última actualización: Febrero 2026</p>
  
                <h3 className="terms-section">1. Información general</h3>
                <p className="terms-para">
                  En cumplimiento con la normativa vigente, se informa que el presente sitio web{" "}
                  <a href="https://bcarsiberica.com" target="_blank" rel="noopener noreferrer">
                    https://bcarsiberica.com
                  </a>{" "}
                  (en adelante, el &quot;Sitio Web&quot;) es titularidad de:
                </p>
                <p className="terms-para">
                  <strong>Razón social:</strong> Best Cars Ibérica S.L.<br />
                  <strong>Domicilio social:</strong> C/ Campanitx 16, Ibiza, 07800, Islas Baleares, España<br />
                  <strong>CIF:</strong> B75905703<br />
                  <strong>Correo electrónico:</strong> direccion@bcarsiberica.com
                </p>
                <p className="terms-para">
                  El acceso y uso del Sitio Web atribuye la condición de usuario (en adelante, el &quot;Usuario&quot;) e implica la aceptación plena y sin reservas de los presentes Términos y Condiciones.
                </p>

                <h3 className="terms-section">2. Objeto del sitio web</h3>
                <p className="terms-para">
                  El Sitio Web tiene como finalidad ofrecer información, intermediación y servicios relacionados con la compra, venta y comercialización de vehículos, tanto nuevos como usados, así como servicios accesorios relacionados con el sector de la automoción.
                </p>
                <p className="terms-para">
                  BestCars Ibérica S.L. actúa como vendedor directo o como intermediario, según el caso concreto, lo cual será debidamente informado en cada operación.
                </p>

                <h3 className="terms-section">3. Condiciones de acceso y uso</h3>
                <p className="terms-para">
                  El acceso al Sitio Web es gratuito. El Usuario se compromete a utilizar el Sitio Web de conformidad con la ley, la buena fe, el orden público y los presentes Términos y Condiciones.
                </p>
                <p className="terms-para">
                  Queda expresamente prohibido: Utilizar el Sitio Web con fines ilícitos o fraudulentos; Introducir o difundir virus informáticos o cualquier sistema susceptible de causar daños; Intentar acceder a áreas restringidas sin autorización.
                </p>

                <h3 className="terms-section">4. Información sobre los vehículos</h3>
                <p className="terms-para">
                  La información, descripciones, fotografías, precios y características de los vehículos publicados en el Sitio Web tienen carácter orientativo y no constituyen una oferta contractual vinculante hasta la formalización expresa del contrato de compraventa.
                </p>
                <p className="terms-para">
                  BestCars Ibérica S.L. se reserva el derecho a corregir errores tipográficos, modificar precios, características o retirar vehículos sin previo aviso.
                </p>

                <h3 className="terms-section">5. Proceso de compra y venta</h3>
                <p className="terms-para">
                  La adquisición de un vehículo se formalizará mediante la firma del correspondiente contrato de compraventa, donde se detallarán las condiciones específicas, precio final, forma de pago, garantías y plazos de entrega.
                </p>
                <p className="terms-para">
                  En operaciones de intermediación, BestCars Ibérica S.L. facilitará el contacto entre las partes, sin asumir responsabilidades más allá de las legalmente exigibles.
                </p>

                <h3 className="terms-section">6. Precios y formas de pago</h3>
                <p className="terms-para">
                  Todos los precios mostrados se expresan en euros (€) e incluyen los impuestos legalmente aplicables, salvo que se indique lo contrario.
                </p>
                <p className="terms-para">
                  Las formas de pago disponibles serán informadas durante el proceso de contratación y podrán incluir transferencia bancaria, financiación u otros medios acordados entre las partes.
                </p>

                <h3 className="terms-section">7. Garantías</h3>
                <p className="terms-para">
                  Los vehículos vendidos por BestCars Ibérica S.L. cuentan con las garantías legalmente establecidas conforme a la normativa española vigente.
                </p>
                <p className="terms-para">
                  En el caso de vehículos de segunda mano, la garantía mínima será la exigida por la ley, salvo mejora expresa indicada en el contrato.
                </p>

                <h3 className="terms-section">8. Responsabilidad</h3>
                <p className="terms-para">
                  BestCars Ibérica S.L. no se hace responsable de: Interrupciones o fallos técnicos del Sitio Web; Daños derivados de un uso indebido del Sitio Web por parte del Usuario; Contenidos de terceros accesibles mediante enlaces externos.
                </p>

                <h3 className="terms-section">9. Propiedad intelectual e industrial</h3>
                <p className="terms-para">
                  Todos los contenidos del Sitio Web (textos, imágenes, logotipos, diseños, software, etc.) son titularidad de BestCars Ibérica S.L. o de terceros con licencia, y están protegidos por la normativa de propiedad intelectual e industrial.
                </p>
                <p className="terms-para">
                  Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
                </p>

                <h3 className="terms-section">10. Protección de datos</h3>
                <p className="terms-para">
                  El tratamiento de los datos personales del Usuario se regirá por lo dispuesto en la Política de Privacidad del Sitio Web, conforme al Reglamento (UE) 2016/679 (RGPD) y demás normativa aplicable.
                </p>

                <h3 className="terms-section">11. Modificaciones</h3>
                <p className="terms-para">
                  BestCars Ibérica S.L. se reserva el derecho a modificar en cualquier momento los presentes Términos y Condiciones. Las modificaciones serán publicadas en el Sitio Web y entrarán en vigor desde su publicación.
                </p>

                <h3 className="terms-section">12. Legislación aplicable y jurisdicción</h3>
                <p className="terms-para">
                  Los presentes Términos y Condiciones se rigen por la legislación española.
                </p>
                <p className="terms-para">
                  Para cualquier controversia que pudiera derivarse del acceso o uso del Sitio Web, las partes se someten expresamente a los Juzgados y Tribunales de la ciudad de Madrid, salvo que la normativa de protección de consumidores establezca otro fuero imperativo.
                </p>
                <p className="terms-para">
                  Si tienes cualquier duda sobre estos Términos y Condiciones, puedes contactar con nosotros a través de los medios indicados en el Sitio Web.
                </p>
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TermsAndConditions;
