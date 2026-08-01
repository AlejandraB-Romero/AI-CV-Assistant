export const DOMAINS_CONFIG = {
  LOGISTICS_SERVICES: {
    id: 'logistics_services',
    label: 'Logística, Almacén, Distribución y Estaciones de Servicio',
    keywords: [
      'picking', 'packing', 'receiving', 'stock', 'inventario', 
      'EPT', 'carretilla', 'logística', 'reposición', 'caja', 
      'expedición', 'almacén', 'gasolinera', 'atención al cliente'
    ],
    metricsAdvice: 'Enfócate en volumen de unidades/pedidos procesados al día, tasa de error 0%, tiempos de expedición y cumplimiento de normativas de seguridad.',
    technicalLabel: 'Operativa de Almacén, Maquinaria y Herramientas'
  },
  HOSPITALITY_CUSTOMER: {
    id: 'hospitality_customer',
    label: 'Hostelería, Restauración y Atención al Cliente',
    keywords: [
      'atención al público', 'camarero', 'cocina', 'APPCC', 'TPV', 
      'mermas', 'servicio', 'satisfacción', 'caja', 'comensales', 'higiene'
    ],
    metricsAdvice: 'Destaca rotación de mesas, tickets medios, estándares de calidad e higiene, gestión de mermas y valoraciones de clientes.',
    technicalLabel: 'Técnicas de Hostelería, Higiene y Software TPV'
  },
  FASHION_TEXTILE: {
    id: 'fashion_textile',
    label: 'Moda, Patronaje, Confección y Estética',
    keywords: [
      'corte', 'confección', 'patronaje', 'escalado', 'remalladora', 
      'costura', 'tejidos', 'asesoría de imagen', 'diseño', 'calidad'
    ],
    metricsAdvice: 'Resalta prendas confeccionadas por jornada, tiempos de ajuste, reducción de desperdicio de tela y control de calidad visual.',
    technicalLabel: 'Maquinaria Industrial, Patronaje y Materiales'
  },
  SOFTWARE_TECH: {
    id: 'software_tech',
    label: 'Tecnología, Desarrollo de Software y Sistemas',
    keywords: [
      'C#', 'JavaScript', 'HTML', 'CSS', 'SQL', 'Git', 'React', 
      'Frontend', 'Backend', 'API', 'Docker', 'POO', 'Node.js'
    ],
    metricsAdvice: 'Menciona cobertura de pruebas, tiempo de respuesta de APIs, usuarios activos, refactorización y arquitectura de software.',
    technicalLabel: 'Stack Tecnológico, Lenguajes y Frameworks'
  },
  ADMIN_GENERAL: {
    id: 'admin_general',
    label: 'Administración, Gestión General y Oficios',
    keywords: [
      'office', 'excel', 'facturación', 'agenda', 'gestión', 
      'trámite', 'documentación', 'ERP', 'recepción'
    ],
    metricsAdvice: 'Destaca volumen de expedientes/facturas gestionadas, digitalización de procesos y optimización de tiempos administrativos.',
    technicalLabel: 'Herramientas de Gestión, Software ERP/Office y Licencias'
  }
};
export const MODELS_CONFIG = {
  defaultTimeoutMs: 60000,
  maxRetries: 2,
  defaultTemperature: 0.1
};