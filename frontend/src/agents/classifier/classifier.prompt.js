export const CLASSIFIER_PROMPT = (cvText) => `
[DIRECTRIZ DE CLASIFICACIÓN DE SECTOR Y PERFIL PROFESIONAL]
Analiza el siguiente CV e identifica el sector profesional principal, el puesto objetivo más adecuado y las herramientas/habilidades operativas clave.

EJEMPLO DE RESPUESTA EN JSON VÁLIDO EN ESPAÑOL:
{
  "detectedSector": "LOGISTICS_SERVICES", 
  "sectorLabel": "Logística, Almacén, Distribución y Servicios",
  "candidateName": "Nombre Detectado",
  "targetRole": "Encargado de Logística / Responsable de Almacén",
  "coreCompetencies": ["Picking y Packing", "Conducción EPT Eléctrico", "Atención al Cliente", "Gestión de Stock"],
  "technicalTools": ["Paquete Office", "Software ERP/Sistemas de Almacén", "Licencia de Conducir B"],
  "recommendedMetricsType": "Volumen de pedidos procesados, gestión de inventario sin errores y optimización de tiempos de entrega."
}

SECTORES POSIBLES A ELEGIR PARA "detectedSector":
- LOGISTICS_SERVICES (Logística, almacén, estaciones de servicio, reposición, transporte)
- HOSPITALITY_CUSTOMER (Hostelería, cocina, camarero, atención al público, atención al cliente)
- FASHION_TEXTILE (Moda, confección, patronaje, estética)
- SOFTWARE_TECH (Desarrollo web, programación, IT, infraestructura)
- ADMIN_GENERAL (Administración, oficina, recepción, otros oficios)

--- TEXTO DEL CV ---
${cvText}
`;