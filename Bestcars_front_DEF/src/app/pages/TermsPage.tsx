import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';

const BASE_URL = 'https://bestcarsiberica.com';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070A10]">
      <BreadcrumbJsonLd
        items={[
          { name: 'Inicio', url: `${BASE_URL}/` },
          { name: 'Términos y condiciones', url: `${BASE_URL}/terminos` },
        ]}
      />
      <Helmet>
        <link rel="canonical" href={`${BASE_URL}/terminos`} />
        <title>Términos y Condiciones — Best Cars Ibérica</title>
        <meta name="description" content="Términos y condiciones de uso del sitio web de Best Cars Ibérica." />
        <meta property="og:title" content="Términos y Condiciones — Best Cars Ibérica" />
        <meta property="og:description" content="Términos y condiciones de uso del sitio web de Best Cars Ibérica." />
        <meta property="og:image" content={`${BASE_URL}/favicon.png`} />
        <meta property="og:url" content={`${BASE_URL}/terminos`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Términos y Condiciones — Best Cars Ibérica" />
        <meta name="twitter:description" content="Términos y condiciones de uso del sitio web de Best Cars Ibérica." />
        <meta name="twitter:image" content={`${BASE_URL}/favicon.png`} />
      </Helmet>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12 text-white/80 text-sm leading-relaxed">
        <h1 className="text-2xl font-black text-white mb-2">Términos y Condiciones de Uso</h1>
        <p className="text-white/50 mb-8">Última actualización: Febrero 2026</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">1. Información general</h2>
        <p className="mb-3">
          En cumplimiento con la normativa vigente, se informa que el presente sitio web{' '}
          <a href="https://bcarsiberica.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            https://bcarsiberica.com
          </a>{' '}
          (en adelante, el &quot;Sitio Web&quot;) es titularidad de:
        </p>
        <p className="mb-3">
          <strong className="text-white">Razón social:</strong> Best Cars Ibérica S.L.<br />
          <strong className="text-white">Domicilio social:</strong> C/ Campanitx 16, Ibiza, 07800, Islas Baleares, España<br />
          <strong className="text-white">CIF:</strong> B75905703<br />
          <strong className="text-white">Correo electrónico:</strong> direccion@bcarsiberica.com
        </p>
        <p className="mb-3">El acceso y uso del Sitio Web atribuye la condición de usuario (en adelante, el &quot;Usuario&quot;) e implica la aceptación plena y sin reservas de los presentes Términos y Condiciones.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">2. Objeto del sitio web</h2>
        <p className="mb-3">El Sitio Web tiene como finalidad ofrecer información, intermediación y servicios relacionados con la compra, venta y comercialización de vehículos, tanto nuevos como usados, así como servicios accesorios relacionados con el sector de la automoción.</p>
        <p className="mb-3">BestCars Ibérica S.L. actúa como vendedor directo o como intermediario, según el caso concreto, lo cual será debidamente informado en cada operación.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">3. Condiciones de acceso y uso</h2>
        <p className="mb-3">El acceso al Sitio Web es gratuito. El Usuario se compromete a utilizar el Sitio Web de conformidad con la ley, la buena fe, el orden público y los presentes Términos y Condiciones.</p>
        <p className="mb-3">Queda expresamente prohibido: Utilizar el Sitio Web con fines ilícitos o fraudulentos; Introducir o difundir virus informáticos o cualquier sistema susceptible de causar daños; Intentar acceder a áreas restringidas sin autorización.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">4. Información sobre los vehículos</h2>
        <p className="mb-3">La información, descripciones, fotografías, precios y características de los vehículos publicados en el Sitio Web tienen carácter orientativo y no constituyen una oferta contractual vinculante hasta la formalización expresa del contrato de compraventa.</p>
        <p className="mb-3">BestCars Ibérica S.L. se reserva el derecho a corregir errores tipográficos, modificar precios, características o retirar vehículos sin previo aviso.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">5. Proceso de compra y venta</h2>
        <p className="mb-3">La adquisición de un vehículo se formalizará mediante la firma del correspondiente contrato de compraventa, donde se detallarán las condiciones específicas, precio final, forma de pago, garantías y plazos de entrega.</p>
        <p className="mb-3">En operaciones de intermediación, BestCars Ibérica S.L. facilitará el contacto entre las partes, sin asumir responsabilidades más allá de las legalmente exigibles.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">6. Precios y formas de pago</h2>
        <p className="mb-3">Todos los precios mostrados se expresan en euros (€) e incluyen los impuestos legalmente aplicables, salvo que se indique lo contrario.</p>
        <p className="mb-3">Las formas de pago disponibles serán informadas durante el proceso de contratación y podrán incluir transferencia bancaria, financiación u otros medios acordados entre las partes.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">7. Garantías</h2>
        <p className="mb-3">Los vehículos vendidos por BestCars Ibérica S.L. cuentan con las garantías legalmente establecidas conforme a la normativa española vigente.</p>
        <p className="mb-3">En el caso de vehículos de segunda mano, la garantía mínima será la exigida por la ley, salvo mejora expresa indicada en el contrato.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">8. Responsabilidad</h2>
        <p className="mb-3">BestCars Ibérica S.L. no se hace responsable de: Interrupciones o fallos técnicos del Sitio Web; Daños derivados de un uso indebido del Sitio Web por parte del Usuario; Contenidos de terceros accesibles mediante enlaces externos.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">9. Propiedad intelectual e industrial</h2>
        <p className="mb-3">Todos los contenidos del Sitio Web (textos, imágenes, logotipos, diseños, software, etc.) son titularidad de BestCars Ibérica S.L. o de terceros con licencia, y están protegidos por la normativa de propiedad intelectual e industrial.</p>
        <p className="mb-3">Queda prohibida su reproducción, distribución o modificación sin autorización expresa.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">10. Protección de datos</h2>
        <p className="mb-3">El tratamiento de los datos personales del Usuario se regirá por lo dispuesto en la Política de Privacidad del Sitio Web, conforme al Reglamento (UE) 2016/679 (RGPD) y demás normativa aplicable.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">11. Modificaciones</h2>
        <p className="mb-3">BestCars Ibérica S.L. se reserva el derecho a modificar en cualquier momento los presentes Términos y Condiciones. Las modificaciones serán publicadas en el Sitio Web y entrarán en vigor desde su publicación.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">12. Legislación aplicable y jurisdicción</h2>
        <p className="mb-3">Los presentes Términos y Condiciones se rigen por la legislación española.</p>
        <p className="mb-3">Para cualquier controversia que pudiera derivarse del acceso o uso del Sitio Web, las partes se someten expresamente a los Juzgados y Tribunales de la ciudad de Madrid, salvo que la normativa de protección de consumidores establezca otro fuero imperativo.</p>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link to="/" className="text-blue-400 hover:underline">&larr; Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
