export interface PermitType {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  checklist: string[];
  ppe: string[];
}

export const permitTypes: Record<string, PermitType> = {
  excavation: {
    title: 'Permiso de Trabajo para Excavación',
    subtitle: 'FS.019 R8 - COPIA NO CONTROLADA',
    icon: 'shovel',
    color: 'purple',
    checklist: [
      '¿Existe el análisis de riesgos y el procedimiento específico para el trabajo a ser realizado?',
      '¿Se ha determinado la clasificación del tipo de suelo a excavar?',
      '¿Se ha verificado que no existan grietas o desprendimientos de material en paredes?',
      '¿Se identificaron fuentes de vibración que afecten la estabilidad de capas excavadas?',
      '¿Se cuenta con señalización adecuada para vehículos y peatones en el área de la excavación?',
      '¿Se ha verificado que no existirá posibilidad de daño a otros servicios bajo tierra?',
      '¿Se ha utilizado algún medio de detección o localización de servicios enterrados?',
      '¿Se dispone de los planos o diagramas de los servicios enterrados (as built)?',
      '¿Se ha establecido la distancia entre el borde de excavación y el tráfico vehicular y peatonal?',
      '¿Se dispone de apuntalamiento o entibado para excavaciones mayores a 1.50 metros?',
      '¿Se realizó una acometida o excavación tipo talud según el tipo de suelo?',
      '¿Se dispone de protección adecuada para excavaciones mayores a 6 metros de profundidad?',
      '¿Se dispone de bomba para remoción de agua?',
      '¿Se autoriza pasos peatonales o tablas de arrastre para cruces de la excavación?',
      '¿Se dispone de extintores portátiles en el sitio de trabajo?',
      '¿Se requiere resguardo contra incendio, y si es así, está asignado?',
      '¿Existe arnés corporal y línea de vida al trabajar cerca de excavaciones > 1,80 mts?',
      '¿Se dispone de equipo de emergencia para recuperación (tabla, collarín, férula) y rescate?',
      '¿Se ha verificado suficiente cantidad de oxígeno en excavaciones mayores de 1.20 metros?',
      '¿Se dispone de medios de escape (escaleras) a distancias no mayores a 7.50 metros?',
      '¿Ha habido prueba de atmósferas tóxicas o peligrosas?',
      '¿El equipo pesado a utilizar fue revisado y validado en su funcionamiento?',
      '¿El personal está capacitado / certificado para realizar el trabajo?',
      '¿Se realizó la reunión inicial o inducción básica de seguridad del trabajo?',
      '¿El personal que ejecutará los trabajos tuvo un descanso adecuado (aprox. 8 horas)?'
    ],
    ppe: [
      'Casco y barbiquejo',
      'Gafas de seguridad',
      'Protector auditivo',
      'Ropa de trabajo',
      'Guantes (Cuero/pigmentados)',
      'Botas de seguridad',
      'Protector facial',
      'Máscara filtrante (mascarilla)',
      'Botas de seguridad p/ agua',
      'Arnés de cuerpo c/ línea'
    ]
  },
  hot: {
    title: 'Permiso de Trabajo en Caliente',
    subtitle: 'FS.020 R10 - COPIA NO CONTROLADA',
    icon: 'fire',
    color: 'yellow',
    checklist: [
      '¿Existe el análisis de riesgos y el procedimiento específico para el trabajo a ser realizado?',
      '¿Las válvulas han sido correctamente cerradas, señalizadas, etiquetadas y con candado para aislar el sistema?',
      '¿Ha sido bloqueado, etiquetado y se ha probado el arranque del circuito eléctrico correcto?',
      '¿El equipo eléctrico a ser usado dispone de aterramiento?',
      '¿Las herramientas manuales y automáticas fueron revisadas y verificadas previo al uso?',
      '¿Los equipos especializados (grúas, tecles, fajas, cadenas, aparejos, inspección, etc.) fueron verificados previamente?',
      '¿El sistema (equipo, recipiente, ducto) ha sido despresurizado, drenado y venteado?',
      '¿El sistema (equipo, recipiente, ducto) ha sido lavado a vapor o con agua (detergente)?',
      '¿El sistema (equipo, recipiente, ducto) ha sido purgado inertizado con nitrógeno?',
      '¿Está el sistema (equipo, recipiente, ducto) limpio y libre de material inflamable?',
      '¿Han sido reconocidas y tapadas las alcantarillas, excavaciones, drenajes, etc.?',
      '¿Se ha reducido la presión del sistema (equipo, recipiente, ducto) a intervenir?',
      '¿Se identificó el producto en el sistema (equipo, recipiente, ducto) a reparar?',
      '¿Se verificó que todos los sistemas sensibles han sido inhibidos o desconectados?',
      '¿Se realizó medición de espesores (soldadura, arenado)?',
      '¿El equipo de suministro de aire para arenador dispone de filtro de respiración aprobado?',
      '¿Los cilindros de gas inflamable / comprimidos disponen de arresta llamas?',
      '¿Se requiere personal de resguardo especializado contra incendio, y si es así, está asignado?',
      '¿Se dispone de extintores portátiles en el sitio de trabajo?',
      '¿Se realizó prueba de atmósferas tóxicas o peligrosas (CO y LEL) con detector?',
      '¿La operación ha sido comunicada a Sala de Control?',
      '¿Se dispone de dispositivos de protección y sombra de luz solar en el área de soldadura?',
      '¿Se dispone del equipo contra quemaduras (waterjel, sabanas, etc.)?',
      '¿El personal está capacitado / certificado para realizar el trabajo?',
      '¿Se realizó la reunión inicial o inducción básica de seguridad del trabajo?',
      '¿Se verificó que durante tareas de soldadura al arco no existan equipos sensibles a inducción?',
      '¿El personal que ejecutará los trabajos tuvo un descanso adecuado (aprox. 8 horas)?'
    ],
    ppe: [
      'Casco y barbiquejo',
      'Gafas de seguridad',
      'Protector auditivo',
      'Ropa de trabajo',
      'Guantes (Cuero/pigmentados)',
      'Botas de seguridad',
      'Protector facial',
      'Máscara filtrante (mascarilla)',
      'Delantal soldadura',
      'Polainas p/ amolador'
    ]
  },
  cold: {
    title: 'Permiso de Trabajo en Frío',
    subtitle: 'FS.021 R11 - COPIA NO CONTROLADA',
    icon: 'wrench',
    color: 'cyan',
    checklist: [
      '¿Existe el análisis de riesgos y el procedimiento específico para el trabajo a ser realizado?',
      '¿Las válvulas han sido correctamente cerradas, señalizadas, etiquetadas y con candado para aislar el sistema?',
      '¿El sistema (equipo, recipiente, ducto) ha sido despresurizado, drenado y venteado?',
      '¿Ha sido bloqueado, etiquetado y se ha probado el arranque del circuito eléctrico correcto?',
      '¿Se verificó que todos los sistemas sensibles han sido inhibidos o desconectados?',
      '¿El equipo eléctrico a ser usado/intervenido dispone de aterramiento o disyuntor diferencial?',
      '¿Las herramientas manuales y automáticas fueron revisadas y verificadas previo al uso?',
      '¿Las herramientas de golpe a ser utilizadas son anti-chispas (bronce, goma, aluminio, etc.)?',
      '¿Los equipos especializados fueron previamente verificados?',
      '¿Los productos de limpieza a ser utilizados no son inflamables?',
      '¿Se dispone de la ventilación y temperatura apropiada en lugares donde se utilizan solventes?',
      '¿Se identificó (HDSM) el producto en el sistema a reparar?',
      '¿Se requiere remoción y manipulación de materiales peligrosos (asbestos, fibra de vidrio, etc.)?',
      '¿Se realizó prueba de atmósferas tóxicas o peligrosas (CO, H2S, O2 y LEL) con detector?',
      '¿Habrá emisión de gas durante el trabajo?',
      '¿Están disponibles los extintores portátiles en el sitio de trabajo?',
      '¿El personal está capacitado / certificado para realizar el trabajo?',
      '¿Se realizó la reunión inicial o inducción básica de seguridad del trabajo?',
      '¿Se verificó la no existencia de cables energizados en cercanías del lugar de trabajo?',
      '¿Existe un banderillero o ayudante obligatorio (guía) cuando se trabaja con equipo de Izaje?',
      '¿El personal que ejecutará los trabajos tuvo un descanso adecuado (aprox. 8 horas)?'
    ],
    ppe: [
      'Casco / barbiquejo requerido para trabajos en altura',
      'Gafas de seguridad',
      'Protector auditivo',
      'Ropa de trabajo',
      'Guantes (Cuero/pigmentados/Precisión)',
      'Botas de seguridad',
      'Protector facial y gafas antiparras',
      'Máscara filtrante / Respirador',
      'Delantal químico',
      'Equipo de Bioseguridad'
    ]
  }
};

export const getPermitTypeConfig = (type: string) => {
  return permitTypes[type] || permitTypes.excavation;
};
