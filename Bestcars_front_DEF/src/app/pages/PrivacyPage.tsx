import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';

const BASE_URL = 'https://bestcarsiberica.com';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070A10]">
      <BreadcrumbJsonLd
        items={[
          { name: 'Inicio', url: `${BASE_URL}/` },
          { name: 'Política de privacidad', url: `${BASE_URL}/privacidad` },
        ]}
      />
      <Helmet>
        <link rel="canonical" href={`${BASE_URL}/privacidad`} />
        <title>Política de Privacidad — Best Cars Ibérica</title>
        <meta name="description" content="Política de privacidad y protección de datos de Best Cars Ibérica." />
        <meta property="og:title" content="Política de Privacidad — Best Cars Ibérica" />
        <meta property="og:description" content="Política de privacidad y protección de datos de Best Cars Ibérica." />
        <meta property="og:image" content={`${BASE_URL}/favicon.png`} />
        <meta property="og:url" content={`${BASE_URL}/privacidad`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Política de Privacidad — Best Cars Ibérica" />
        <meta name="twitter:description" content="Política de privacidad y protección de datos de Best Cars Ibérica." />
        <meta name="twitter:image" content={`${BASE_URL}/favicon.png`} />
      </Helmet>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12 text-white/80 text-sm leading-relaxed">
        <h1 className="text-2xl font-black text-white mb-2">Política de Privacidad</h1>
        <p className="text-white/50 mb-8">Última actualización: Febrero 2026</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">1. Responsable del tratamiento</h2>
        <p className="mb-3">
          <strong className="text-white">Razón social:</strong> Best Cars Ibérica S.L.<br />
          <strong className="text-white">Domicilio social:</strong> C/ Campanitx 16, Ibiza, 07800, Islas Baleares, España<br />
          <strong className="text-white">CIF:</strong> B75905703<br />
          <strong className="text-white">Correo electrónico:</strong> direccion@bcarsiberica.com
        </p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">2. Datos personales que recopilamos</h2>
        <p className="mb-3">Recopilamos los datos que nos facilitas voluntariamente a través de los formularios de contacto, solicitud de prueba de conducción y cualquier otra comunicación: nombre, correo electrónico, teléfono y mensaje.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">3. Finalidad del tratamiento</h2>
        <p className="mb-3">Los datos personales serán tratados con las siguientes finalidades: Gestionar las solicitudes de información y contacto; Facilitar la intermediación en la compra-venta de vehículos; Enviar comunicaciones comerciales relacionadas, previo consentimiento expreso.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">4. Base jurídica</h2>
        <p className="mb-3">El tratamiento de datos se basa en el consentimiento del usuario, la ejecución de un contrato o precontrato, y el interés legítimo del responsable, según corresponda.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">5. Conservación de datos</h2>
        <p className="mb-3">Los datos personales se conservarán mientras exista la relación comercial y durante el plazo legalmente establecido para atender posibles responsabilidades derivadas del tratamiento.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">6. Derechos del usuario</h2>
        <p className="mb-3">El usuario puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad dirigiéndose a direccion@bcarsiberica.com, acompañando copia de su DNI o documento identificativo.</p>

        <h2 className="text-lg font-bold text-white mt-8 mb-3">7. Seguridad</h2>
        <p className="mb-3">Best Cars Ibérica S.L. aplica las medidas técnicas y organizativas adecuadas para garantizar la seguridad de los datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado.</p>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link to="/" className="text-blue-400 hover:underline">&larr; Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
