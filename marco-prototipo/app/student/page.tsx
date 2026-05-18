'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Lightbulb, ChevronRight,
  CheckCircle2, RotateCcw,
  Menu, Settings, Home, BookOpen, TrendingUp, BarChart2,
  Clipboard, FileText,
  Calculator, Landmark, Leaf, Languages, PenLine, FlaskConical, Cpu,
  Mic, Image, Paperclip, MousePointer2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { pushMessage, pushActivity } from '@/lib/demoStore';

/* ── Tokens ── */
const T = {
  bg: '#fafaf8', white: '#ffffff', black: '#0a0a0a',
  gray: '#6b6b6b', soft: '#9a9a96', border: '#e0dfd9',
  borderSoft: '#ebebe6', note: '#f7f6f2',
  deep: '#2c2e7a', accent: '#6366cc', violet: '#eeeefa', violet2: '#f5f5fc',
  success: '#2d6a4f', successSoft: '#e7f1ec',
  warn: '#b45309', warnSoft: '#fef3c7',
  danger: '#b91c1c', dangerSoft: '#fee2e2',
};

/* ── Types ── */
type Screen = 'loading' | 'home' | 'subject' | 'cuaderno' | 'chat';
type Diff = 'Básica' | 'Intermedia' | 'Avanzada';

interface Msg { role: 'marco' | 'student'; text: string }
interface Question {
  id: number; preview: string; difficulty: Diff; done: boolean;
  socrático: string; context: string;
  hints: string[];
  followUp: string; // Marco's 2nd message after student answers
  praise: string;   // Marco's 3rd message (final)
}
interface Subject {
  id: string; name: string; icon: string;
  completed: number; total: number;
  topic: string;
  questions: Question[];
}
interface Cuaderno {
  id: string; title: string; intentos: number; tipo: 'teoria' | 'practica';
}
interface CuadernoTurns {
  intro: string; followUp: string; closing: string; hints: string[];
}
interface Leccion {
  num: number; title: string; cuadernos: Cuaderno[];
}
interface Bloque {
  num: number; title: string; lecciones: Leccion[];
}

/* ── Data ── */
const SUBJECTS: Subject[] = [
  {
    id: 'mates', name: 'Matemáticas', icon: 'M',
    completed: 2, total: 4,
    topic: 'Bloque 2 · Funciones y álgebra',
    questions: [
      { id: 1, preview: '¿Qué representa la pendiente de una recta?', difficulty: 'Básica', done: true,
        socrático: '¿Qué representa la pendiente de una recta? Piensa en una carretera que sube: ¿qué te diría ese número sobre la inclinación?',
        context: 'Una recta tiene la forma y = mx + b, donde m es la pendiente.',
        hints: ['¿Qué pasa con y cuando x aumenta 1 unidad?', '¿Cuánto "sube" la recta por cada paso a la derecha?', 'Relaciona pendiente con velocidad de cambio...'],
        followUp: 'Exacto. Ahora dime: si la pendiente es 0, ¿cómo sería la recta visualmente?',
        praise: 'Perfecto. Una pendiente cero significa recta horizontal: no sube ni baja. La pendiente mide la velocidad de cambio de y respecto a x.' },
      { id: 2, preview: '¿Por qué no existe la raíz cuadrada de un número negativo?', difficulty: 'Intermedia', done: true,
        socrático: '¿Por qué no existe la raíz cuadrada de un número negativo en los reales? Empieza pensando: ¿qué número al cuadrado da resultado negativo?',
        context: 'La raíz cuadrada invierte la operación de elevar al cuadrado.',
        hints: ['¿Qué pasa cuando multiplicas un número por sí mismo?', '¿Puede un cuadrado ser negativo?', 'Piensa en el signo del resultado...'],
        followUp: '¡Bien! Entonces, ¿qué inventaron los matemáticos para poder trabajar con esas raíces?',
        praise: 'Exactamente: los números imaginarios (i = √−1). Amplían los reales y permiten resolver ecuaciones que antes parecían imposibles.' },
      { id: 3, preview: '¿Cómo razonarías la fórmula del área del círculo?', difficulty: 'Intermedia', done: false,
        socrático: '¿Cómo razonarías que el área de un círculo es πr²? Imagina dividir el círculo en sectores muy finos y reorganizarlos.',
        context: 'El número π es la razón entre la circunferencia y el diámetro de cualquier círculo.',
        hints: ['¿En qué figura se convierte si cortas el círculo en muchos triángulos finos?', '¿Cuál sería la base y la altura de esa figura?', 'La base = circunferencia/2 = πr...'],
        followUp: 'Muy bien. Si la base es πr y la altura es r, ¿qué área tiene ese rectángulo aproximado?',
        praise: 'Perfecto: base × altura = πr × r = πr². Así se puede intuir la fórmula sin memorizarla.' },
      { id: 4, preview: '¿Qué relación hay entre derivada e integral?', difficulty: 'Avanzada', done: false,
        socrático: '¿Qué relación hay entre derivada e integral? ¿Son operaciones opuestas, como la suma y la resta?',
        context: 'El Teorema Fundamental del Cálculo conecta estas dos operaciones.',
        hints: ['¿Qué hace la derivada con una función?', '¿Y la integral?', 'Piensa en velocidad y posición...'],
        followUp: 'Bien orientado. Si la derivada de la posición es velocidad, ¿qué da la integral de la velocidad?',
        praise: 'Exacto: la posición. Son operaciones inversas. Eso es el Teorema Fundamental del Cálculo.' },
    ],
  },
  {
    id: 'historia', name: 'Historia', icon: 'H',
    completed: 0, total: 4,
    topic: 'UD 4 · El siglo XX',
    questions: [
      { id: 1, preview: '¿Por qué cayó el Imperio Romano de Occidente?', difficulty: 'Intermedia', done: false,
        socrático: '¿Por qué crees que cayó el Imperio Romano de Occidente en el 476 d.C.? ¿Fue algo repentino o un proceso largo?',
        context: 'El Imperio Romano fue una de las mayores civilizaciones de la historia, con siglos de dominio en Europa.',
        hints: ['¿Qué problemas internos tenía el Imperio?', '¿Qué presiones venían del exterior?', 'Piensa en economía, ejército y política...'],
        followUp: 'Buen análisis. ¿Cuál crees que fue el factor más determinante: las invasiones externas o la desintegración interna?',
        praise: 'Excelente. Los historiadores debaten esto aún hoy. Ambos factores se retroalimentaron: la corrupción interna debilitó la capacidad de resistir las invasiones.' },
      { id: 2, preview: '¿Qué papel jugó la Iglesia en la Edad Media?', difficulty: 'Básica', done: false,
        socrático: '¿Qué papel tuvo la Iglesia Católica en la Edad Media europea? ¿Solo era espiritual o también político?',
        context: 'En la Edad Media, prácticamente toda Europa occidental era cristiana.',
        hints: ['¿Quién tenía el monopolio de la lectura y escritura?', '¿Qué eran los feudos eclesiásticos?', 'Piensa en la relación entre el Papa y los reyes...'],
        followUp: 'Correcto. ¿Puedes darme un ejemplo concreto de conflicto entre el poder religioso y el poder político?',
        praise: 'La Querella de las Investiduras (s. XI-XII) es el ejemplo clásico. Papas y emperadores disputaban quién nombraba a los obispos.' },
      { id: 3, preview: '¿Cómo cambió la imprenta el mundo del siglo XV?', difficulty: 'Básica', done: false,
        socrático: '¿Cómo crees que la imprenta de Gutenberg transformó el mundo? Considera: ¿quién tenía acceso al conocimiento antes?',
        context: 'Antes de la imprenta, los libros se copiaban a mano por monjes y tardaban meses.',
        hints: ['¿Cuánto costaba un libro copiado a mano?', '¿Quién podía permitírselo?', 'Piensa en la velocidad y el coste de la información...'],
        followUp: '¡Exacto! ¿Y qué movimientos históricos crees que no habrían existido sin la imprenta?',
        praise: 'La Reforma Protestante, la Ilustración... Lutero usó la imprenta para difundir sus 95 tesis. Sin ella, quizás no llegaban a toda Europa.' },
      { id: 4, preview: '¿Qué causó la Primera Guerra Mundial?', difficulty: 'Avanzada', done: false,
        socrático: '¿Qué causó la Primera Guerra Mundial? El asesinato del archiduque Francisco Fernando fue el detonante, pero ¿cuál era el verdadero combustible?',
        context: 'En 1914 Europa estaba dividida en dos grandes alianzas militares con tensiones acumuladas.',
        hints: ['¿Qué eran la Triple Alianza y la Triple Entente?', '¿Qué papel jugó el imperialismo y el nacionalismo?', 'Piensa en la metáfora del barril de pólvora...'],
        followUp: 'Bien. ¿Crees que la guerra era inevitable, o pudo evitarse con mejores negociaciones diplomáticas?',
        praise: 'Debate historiográfico abierto. La mayoría coincide en que el sistema de alianzas convirtió un conflicto regional en mundial casi automáticamente.' },
    ],
  },
  {
    id: 'bio', name: 'Biología', icon: 'B',
    completed: 3, total: 4,
    topic: 'Tema 5 · Genética y herencia',
    questions: [
      { id: 1, preview: '¿Qué diferencia hay entre mitosis y meiosis?', difficulty: 'Intermedia', done: true,
        socrático: '¿Cuál es la diferencia clave entre mitosis y meiosis? Piensa en para qué sirve cada una.',
        context: 'Ambos son procesos de división celular, pero con propósitos distintos.',
        hints: ['¿Cuántas células produce cada una?', '¿Cuántos cromosomas tiene cada célula resultante?', '¿Cuál sirve para reproducción sexual?'],
        followUp: '¿Por qué la meiosis necesita reducir a la mitad el número de cromosomas?',
        praise: 'Exacto: para que al unirse dos gametos, el número de cromosomas se restaure (2n). Si no, cada generación lo duplicaría.' },
      { id: 2, preview: '¿Cómo funciona la selección natural?', difficulty: 'Básica', done: true,
        socrático: '¿Cómo funciona la selección natural? Empieza por pensar: ¿por qué algunos individuos sobreviven más que otros?',
        context: 'Darwin observó variación hereditaria en las poblaciones y diferencias en supervivencia.',
        hints: ['¿Todos los individuos son iguales en una población?', '¿Qué ocurre con los que tienen ventajas adaptativas?', 'Piensa en varias generaciones...'],
        followUp: 'Bien. ¿Puede la selección natural crear algo completamente nuevo, o solo selecciona lo que ya existe?',
        praise: 'Solo selecciona: la variación proviene de mutaciones aleatorias. La selección "filtra" lo que funciona en ese ambiente.' },
      { id: 3, preview: '¿Qué es el ADN y por qué es importante?', difficulty: 'Básica', done: true,
        socrático: '¿Qué es el ADN y por qué es tan importante para los seres vivos? Piensa en qué información contiene.',
        context: 'El ADN está en el núcleo de casi todas las células de tu cuerpo.',
        hints: ['¿De qué está hecho físicamente?', '¿Qué "instrucciones" guarda?', 'Piensa en proteínas y funciones celulares...'],
        followUp: 'Correcto. ¿Cómo pasa de la información del ADN a una proteína concreta?',
        praise: 'ADN → ARNm (transcripción) → proteína (traducción). Eso es el dogma central de la biología molecular.' },
      { id: 4, preview: '¿Cómo se transmiten las enfermedades genéticas?', difficulty: 'Avanzada', done: false,
        socrático: '¿Cómo se transmiten las enfermedades genéticas de padres a hijos? ¿Qué diferencia hay entre dominante y recesiva?',
        context: 'Los genes se heredan por pares, uno de cada progenitor.',
        hints: ['¿Qué son alelos?', '¿Cuándo se expresa un gen recesivo?', 'Piensa en el cuadro de Punnett...'],
        followUp: 'Bien. Si dos portadores sanos de un gen recesivo tienen hijos, ¿qué probabilidad hay de que un hijo tenga la enfermedad?',
        praise: '25%. Eso explica enfermedades como la fibrosis quística: ambos padres son portadores pero no enfermos.' },
    ],
  },
  {
    id: 'ingles', name: 'Inglés', icon: 'I',
    completed: 1, total: 4,
    topic: 'Unit 3 · Perfect tenses',
    questions: [
      { id: 1, preview: "What's the difference between 'since' and 'for'?", difficulty: 'Básica', done: true,
        socrático: "What's the difference between 'since' and 'for' with present perfect? Think about what each one describes.",
        context: "Both are used with present perfect tense, but they express time differently.",
        hints: ["Does 'since' describe a duration or a starting point?", "Does 'for' describe a duration or a starting point?", "Try using them in a sentence with a time expression..."],
        followUp: "Good! Can you give me an example sentence for each one?",
        praise: "'I've lived here for 5 years' (duration) vs 'I've lived here since 2019' (starting point). Now you've got it." },
      { id: 2, preview: "When do you use 'will' vs 'going to'?", difficulty: 'Intermedia', done: false,
        socrático: "When do you use 'will' vs 'going to' for future? Think about what you know vs what you've decided.",
        context: "English has several ways to express future, and each carries a different nuance.",
        hints: ["Is 'going to' for spontaneous decisions or plans already made?", "Is 'will' for predictions, promises, or spontaneous decisions?", "Consider: 'Look at those clouds. It ____ rain.'"],
        followUp: "Exactly! Now which would you use: 'I decided last week — I ____ study medicine'?",
        praise: "'I'm going to study medicine' — planned decision. 'Will' would sound like you just decided right now." },
      { id: 3, preview: "What are phrasal verbs and why are they tricky?", difficulty: 'Básica', done: false,
        socrático: "What makes phrasal verbs so tricky for Spanish speakers? Can you explain with an example?",
        context: "Phrasal verbs combine a verb with a preposition or adverb to create a new meaning.",
        hints: ["What does 'give up' mean vs just 'give'?", "Can you always guess the meaning from the parts?", "Think about 'run out of', 'look after'..."],
        followUp: "Right! And are all phrasal verbs separable? For example, can you say 'I looked the word up' AND 'I looked up the word'?",
        praise: "Some are separable, some aren't. 'Look up' is separable; 'run into' (meet by chance) is not — you can't say 'run someone into'." },
      { id: 4, preview: "How does passive voice change a sentence's focus?", difficulty: 'Avanzada', done: false,
        socrático: "How does the passive voice change the focus of a sentence? Compare: 'Shakespeare wrote Hamlet' vs 'Hamlet was written by Shakespeare'.",
        context: "Passive voice is formed with 'to be' + past participle.",
        hints: ["What is the subject of each sentence?", "Which sentence focuses on the action? Which on the result?", "When might you use passive if you don't know who did something?"],
        followUp: "Good thinking. When would a scientist prefer passive voice in a research paper?",
        praise: "In academic writing, passive ('The experiment was conducted...') removes the personal 'I', which sounds more objective and formal." },
    ],
  },
  {
    id: 'lengua', name: 'Lengua', icon: 'L',
    completed: 1, total: 4,
    topic: 'Bloque 3 · Textos argumentativos',
    questions: [
      { id: 1, preview: '¿Qué diferencia hay entre una opinión y un argumento?', difficulty: 'Básica', done: true,
        socrático: '¿Qué diferencia hay entre dar una opinión y construir un argumento? ¿Basta con decir "creo que..." para convencer a alguien?',
        context: 'Los textos argumentativos buscan persuadir al lector mediante razones y evidencias.',
        hints: ['¿Una opinión necesita pruebas para sostenerse?', '¿Un argumento puede quedarse en el "me parece"?', 'Piensa en lo que necesitas para ganar un debate...'],
        followUp: 'Exacto. ¿Cuáles son los tres elementos básicos de un argumento sólido?',
        praise: 'Tesis (lo que defiendes), razones (por qué) y evidencia (pruebas). La opinión sola es solo el punto de partida.' },
      { id: 2, preview: '¿Por qué importa el punto de vista del narrador?', difficulty: 'Básica', done: false,
        socrático: '¿Cambia la historia si se narra en primera o en tercera persona? ¿Por qué elige el autor uno u otro punto de vista?',
        context: 'El narrador determina qué información recibe el lector y desde qué perspectiva.',
        hints: ['¿Qué sabe un narrador en 1.ª persona que uno omnisciente no puede saber?', '¿Y al revés?', 'Piensa qué efectos emocionales produce cada perspectiva...'],
        followUp: 'Bien. ¿Puedes pensar en una obra donde el punto de vista sea clave para el efecto emocional?',
        praise: 'El narrador no confiable (1.ª persona que miente o se equivoca) obliga al lector a leer críticamente. Es uno de los recursos más potentes en literatura.' },
      { id: 3, preview: '¿Cómo distingues un texto persuasivo de uno informativo?', difficulty: 'Intermedia', done: false,
        socrático: '¿Cómo sabes si un texto quiere informarte o convencerte? ¿Pueden coexistir ambas intenciones?',
        context: 'Los textos se clasifican según su intención comunicativa principal.',
        hints: ['¿El texto presenta "los dos lados" o solo uno?', '¿Usa lenguaje cargado emocionalmente o neutro?', 'Fíjate en las palabras que elige: ¿son todas neutras?'],
        followUp: '¿Puede un texto informativo usar recursos persuasivos sin que nos demos cuenta?',
        praise: 'La propaganda funciona exactamente así: parece informar pero selecciona qué contar para guiar tu conclusión. Por eso el pensamiento crítico es tan importante.' },
      { id: 4, preview: '¿Puede un texto ser completamente objetivo?', difficulty: 'Avanzada', done: false,
        socrático: '¿Existe un texto completamente objetivo? ¿O toda escritura lleva la marca de quien la escribe?',
        context: 'La objetividad periodística y científica es un ideal, pero los textos siempre tienen autor.',
        hints: ['¿Elegir qué incluir y qué omitir ya es una decisión subjetiva?', '¿El lenguaje que usas lleva carga emocional?', 'Piensa en si una fotografía puede ser objetiva...'],
        followUp: '¿Cómo podría un escritor minimizar su sesgo aunque no pueda eliminarlo del todo?',
        praise: 'La objetividad total es un mito útil: sirve como ideal que nos hace más rigurosos, pero reconocer los propios sesgos es el primer paso hacia la escritura honesta.' },
    ],
  },
  {
    id: 'fyq', name: 'Física y Química', icon: 'FQ',
    completed: 0, total: 4,
    topic: 'UD 2 · Reacciones químicas',
    questions: [
      { id: 1, preview: '¿Por qué flota el hielo en el agua?', difficulty: 'Básica', done: false,
        socrático: '¿Por qué el hielo flota en el agua cuando la mayoría de los sólidos se hunden en su líquido? ¿Qué tiene de especial el agua?',
        context: 'La densidad determina si un cuerpo flota o se hunde en un fluido.',
        hints: ['¿Qué ocurre con el volumen del agua al congelarse?', '¿Cambia la masa al congelarse?', 'Si el volumen sube y la masa es la misma, ¿qué pasa con la densidad?'],
        followUp: '¡Correcto! ¿Qué consecuencias tiene esto para la vida en los lagos en invierno?',
        praise: 'El hielo es menos denso porque el agua al congelarse forma una red cristalina que ocupa más espacio. Gracias a eso los lagos no se congelan hasta el fondo y la vida acuática sobrevive.' },
      { id: 2, preview: '¿Qué diferencia un cambio físico de uno químico?', difficulty: 'Básica', done: false,
        socrático: '¿Qué diferencia hay entre un cambio físico y uno químico? Cuando rompes papel y cuando lo quemas, ¿pasa lo mismo?',
        context: 'Los cambios físicos no alteran la composición química de la materia; los químicos sí.',
        hints: ['¿El papel roto sigue siendo papel?', '¿Las cenizas del papel quemado siguen siendo papel?', '¿Se puede revertir el cambio?'],
        followUp: 'Bien. Dame dos indicios que nos avisan de que está ocurriendo una reacción química.',
        praise: 'Cambio de color, producción de gas, luz, calor o un precipitado son señales típicas. La clave: se forman nuevas sustancias con propiedades distintas.' },
      { id: 3, preview: '¿Por qué varía la velocidad de una reacción química?', difficulty: 'Intermedia', done: false,
        socrático: '¿Por qué una reacción ocurre más rápido en ciertas condiciones? Piensa en cocinar: ¿por qué usamos fuego?',
        context: 'La velocidad de reacción depende de temperatura, concentración y superficie de contacto.',
        hints: ['¿Qué hace que las partículas choquen más a menudo?', '¿Qué hace la temperatura con la energía de las partículas?', '¿Es lo mismo disolver un terrón de azúcar o azúcar en polvo?'],
        followUp: '¿Qué hace un catalizador y por qué es tan valioso en la industria?',
        praise: 'Un catalizador acelera la reacción sin consumirse. Reduce costes energéticos y tiempo. Los catalizadores biológicos son las enzimas.' },
      { id: 4, preview: '¿Qué se conserva siempre en una reacción química?', difficulty: 'Avanzada', done: false,
        socrático: '¿Qué se conserva siempre aunque aparentemente "desaparezca" materia al quemar algo? Piensa en el fuego.',
        context: 'La Ley de Lavoisier establece un principio fundamental sobre la materia.',
        hints: ['Si quemas madera y pesas las cenizas, ¿pesan lo mismo?', '¿Dónde fue el resto?', 'Cuenta los átomos antes y después de la reacción...'],
        followUp: 'En la ecuación 2H₂ + O₂ → 2H₂O, ¿cómo verificarías que se conserva la masa?',
        praise: 'Contando átomos: 4H + 2O antes = 4H + 2O después. La masa de reactivos iguala la de productos. Eso es la Ley de Conservación de la Masa.' },
    ],
  },
  {
    id: 'tecnologia', name: 'Tecnología', icon: 'T',
    completed: 2, total: 4,
    topic: 'Bloque 1 · Electricidad y circuitos',
    questions: [
      { id: 1, preview: '¿Por qué necesitamos resistencias en un circuito?', difficulty: 'Básica', done: true,
        socrático: '¿Por qué ponemos resistencias en un circuito? ¿Qué pasaría si conectaras una bombilla directamente a una batería sin nada más?',
        context: 'Las resistencias controlan el flujo de corriente eléctrica en un circuito.',
        hints: ['¿Qué ocurre si pasa demasiada corriente por la bombilla?', '¿Qué hace la resistencia con la corriente?', 'Piensa en la Ley de Ohm: V = I × R...'],
        followUp: 'Si duplico la resistencia en el circuito, ¿qué le pasa a la intensidad?',
        praise: 'Se reduce a la mitad (V = I × R, si R dobla, I se divide). Las resistencias protegen los componentes y permiten controlar exactamente la corriente necesaria.' },
      { id: 2, preview: '¿Qué diferencia a un conductor de un aislante?', difficulty: 'Básica', done: true,
        socrático: '¿Qué hace que algunos materiales conduzcan la electricidad y otros no? Piensa en los cables: ¿por qué llevan una capa de plástico?',
        context: 'Los materiales se clasifican según su capacidad para transportar cargas eléctricas.',
        hints: ['¿Qué tienen los metales que no tienen los plásticos a nivel atómico?', '¿Para qué sirve exactamente la cubierta plástica del cable?', 'Piensa en electrones libres...'],
        followUp: '¿Existe algo intermedio entre conductor y aislante? ¿Para qué se usa?',
        praise: 'Los semiconductores (silicio, germanio) son la base de toda la electrónica: transistores, chips, diodos. Podemos controlar cuándo conducen y cuándo no.' },
      { id: 3, preview: '¿Cómo difieren los circuitos en serie y en paralelo?', difficulty: 'Intermedia', done: false,
        socrático: '¿Qué diferencia hay entre un circuito en serie y uno en paralelo? Piensa en las luces de Navidad: si una se funde, ¿las demás se apagan?',
        context: 'Los componentes pueden conectarse de distintas formas con efectos muy diferentes.',
        hints: ['En serie, ¿hay un solo camino para la corriente o varios?', 'En paralelo, si un componente falla, ¿afecta a los demás?', 'Piensa en la tensión: ¿se divide o es la misma en paralelo?'],
        followUp: '¿Por qué las instalaciones eléctricas de las casas usan circuitos en paralelo y no en serie?',
        praise: 'Porque cada aparato funciona independientemente con la misma tensión (220V). En serie, apagar uno apagaría todos y la tensión se repartiría de forma desigual.' },
      { id: 4, preview: '¿Por qué un cortocircuito puede ser peligroso?', difficulty: 'Intermedia', done: false,
        socrático: '¿Qué es un cortocircuito y por qué puede causar un incendio? ¿Qué pasa cuando la corriente encuentra un camino sin resistencia?',
        context: 'Los sistemas eléctricos tienen protecciones como fusibles y disyuntores.',
        hints: ['¿Qué pasa con la intensidad si la resistencia es casi cero? (V = I × R)', '¿Qué hace la corriente muy alta al cable?', '¿Qué hace exactamente un fusible?'],
        followUp: '¿Cómo protege un fusible el circuito y por qué no puede sustituirse por un cable cualquiera?',
        praise: 'El fusible se funde antes de que el calor dañe el circuito o cause un incendio. Sustituirlo por un cable elimina esa protección: es muy peligroso.' },
    ],
  },
];

/* ── Subject accent colors ── */
const SUBJECT_COLORS: Record<string, { pill: string; color: string; hover: string; border: string; progress: string }> = {
  mates:   { pill: '#eeeefa', color: '#2c2e7a', hover: '#d8d8f8', border: '#b8b9e6', progress: '#6366cc' },
  historia:{ pill: '#fef3c7', color: '#92400e', hover: '#fde68a', border: '#f59e0b', progress: '#d97706' },
  bio:     { pill: '#d1fae5', color: '#065f46', hover: '#a7f3d0', border: '#34d399', progress: '#10b981' },
  ingles:    { pill: '#dbeafe', color: '#1e3a8a', hover: '#bfdbfe', border: '#60a5fa', progress: '#3b82f6' },
  lengua:    { pill: '#fce7f3', color: '#9d174d', hover: '#fbcfe8', border: '#f472b6', progress: '#ec4899' },
  fyq:       { pill: '#ffedd5', color: '#7c2d12', hover: '#fed7aa', border: '#fb923c', progress: '#f97316' },
  tecnologia:{ pill: '#e0f2fe', color: '#0c4a6e', hover: '#bae6fd', border: '#38bdf8', progress: '#0ea5e9' },
};
const SC = (id: string) => SUBJECT_COLORS[id] ?? SUBJECT_COLORS['mates'];

/* ── Subject icons (lucide) ── */
const SUBJECT_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  mates:      Calculator,
  historia:   Landmark,
  bio:        Leaf,
  ingles:     Languages,
  lengua:     PenLine,
  fyq:        FlaskConical,
  tecnologia: Cpu,
};

/* ── Bloques / lecciones / cuadernos por asignatura ── */
const BLOQUES: Record<string, Bloque[]> = {
  mates: [
    { num: 1, title: 'Números y operaciones', lecciones: [
      { num: 1, title: 'Números reales y racionales', cuadernos: [
        { id: 'mc1', title: 'Fracciones y decimales', intentos: 2, tipo: 'teoria' },
        { id: 'mc2', title: 'Potencias y raíces', intentos: 1, tipo: 'teoria' },
        { id: 'mc3', title: 'Ejercicios: fracciones mixtas', intentos: 3, tipo: 'practica' },
      ]},
      { num: 2, title: 'Operaciones con fracciones', cuadernos: [
        { id: 'mc4', title: 'Suma y resta de fracciones', intentos: 0, tipo: 'teoria' },
        { id: 'mc5', title: 'Problemas resueltos paso a paso', intentos: 1, tipo: 'practica' },
      ]},
    ]},
    { num: 2, title: 'Álgebra y ecuaciones', lecciones: [
      { num: 3, title: 'Ecuaciones de primer grado', cuadernos: [
        { id: 'mc6', title: 'Ecuaciones lineales básicas', intentos: 1, tipo: 'teoria' },
        { id: 'mc7', title: 'Batería de ecuaciones', intentos: 0, tipo: 'practica' },
        { id: 'mc8', title: 'Problemas con ecuaciones', intentos: 0, tipo: 'practica' },
      ]},
      { num: 4, title: 'Sistemas de ecuaciones', cuadernos: [] },
    ]},
    { num: 3, title: 'Geometría y estadística', lecciones: [
      { num: 5, title: 'Geometría plana', cuadernos: [] },
      { num: 6, title: 'Estadística descriptiva', cuadernos: [] },
    ]},
  ],
  historia: [
    { num: 1, title: 'Mundo antiguo y Edad Media', lecciones: [
      { num: 1, title: 'El mundo antiguo', cuadernos: [] },
      { num: 2, title: 'El Imperio Romano', cuadernos: [
        { id: 'hc1', title: 'Causas de la caída del Imperio', intentos: 1, tipo: 'teoria' },
        { id: 'hc2', title: 'Análisis de fuentes primarias', intentos: 0, tipo: 'practica' },
      ]},
    ]},
    { num: 2, title: 'Edad Moderna', lecciones: [
      { num: 3, title: 'Renacimiento e imprenta', cuadernos: [
        { id: 'hc3', title: 'La imprenta y la Reforma', intentos: 0, tipo: 'teoria' },
      ]},
      { num: 4, title: 'Descubrimientos geográficos', cuadernos: [] },
    ]},
    { num: 3, title: 'Siglos XIX y XX', lecciones: [
      { num: 5, title: 'Industrialización', cuadernos: [] },
      { num: 6, title: 'Las guerras mundiales', cuadernos: [] },
    ]},
  ],
  bio: [
    { num: 1, title: 'La célula', lecciones: [
      { num: 1, title: 'Estructura celular', cuadernos: [
        { id: 'bc1', title: 'Procariota vs eucariota', intentos: 3, tipo: 'teoria' },
        { id: 'bc2', title: 'Identifica las partes de la célula', intentos: 2, tipo: 'practica' },
      ]},
      { num: 2, title: 'División celular', cuadernos: [
        { id: 'bc3', title: 'Mitosis y meiosis', intentos: 1, tipo: 'teoria' },
        { id: 'bc4', title: 'Ordena las fases de la mitosis', intentos: 0, tipo: 'practica' },
      ]},
    ]},
    { num: 2, title: 'Genética y evolución', lecciones: [
      { num: 3, title: 'Herencia mendeliana', cuadernos: [
        { id: 'bc5', title: 'Leyes de Mendel', intentos: 0, tipo: 'teoria' },
        { id: 'bc6', title: 'Cruces genéticos', intentos: 0, tipo: 'practica' },
      ]},
      { num: 4, title: 'Selección natural', cuadernos: [
        { id: 'bc7', title: 'Darwin y la evolución', intentos: 2, tipo: 'teoria' },
      ]},
    ]},
    { num: 3, title: 'Ecosistemas', lecciones: [
      { num: 5, title: 'Cadenas tróficas', cuadernos: [] },
      { num: 6, title: 'Impacto ambiental', cuadernos: [] },
    ]},
  ],
  ingles: [
    { num: 1, title: 'Grammar essentials', lecciones: [
      { num: 1, title: 'Tenses overview', cuadernos: [] },
      { num: 2, title: 'Perfect tenses', cuadernos: [
        { id: 'ec1', title: 'Since vs For', intentos: 1, tipo: 'teoria' },
        { id: 'ec2', title: 'Fill in the gaps', intentos: 0, tipo: 'practica' },
        { id: 'ec3', title: 'Past perfect in context', intentos: 0, tipo: 'teoria' },
      ]},
    ]},
    { num: 2, title: 'Vocabulary & writing', lecciones: [
      { num: 3, title: 'Phrasal verbs', cuadernos: [] },
      { num: 4, title: 'Essay writing', cuadernos: [] },
    ]},
  ],
  lengua: [
    { num: 1, title: 'Comunicación y texto', lecciones: [
      { num: 1, title: 'Tipos de texto', cuadernos: [] },
      { num: 2, title: 'Textos argumentativos', cuadernos: [] },
    ]},
    { num: 2, title: 'Literatura', lecciones: [
      { num: 3, title: 'Literatura española', cuadernos: [] },
    ]},
  ],
  fyq: [
    { num: 1, title: 'Química', lecciones: [
      { num: 1, title: 'Estructura de la materia', cuadernos: [] },
      { num: 2, title: 'Reacciones químicas', cuadernos: [] },
    ]},
    { num: 2, title: 'Física', lecciones: [
      { num: 3, title: 'Cinemática', cuadernos: [] },
      { num: 4, title: 'Dinámica y fuerzas', cuadernos: [] },
    ]},
  ],
  tecnologia: [
    { num: 1, title: 'Electricidad', lecciones: [
      { num: 1, title: 'Circuitos eléctricos', cuadernos: [
        { id: 'tc1', title: 'Ley de Ohm y resistencias', intentos: 2, tipo: 'teoria' },
        { id: 'tc2', title: 'Calcula resistencias en serie y paralelo', intentos: 1, tipo: 'practica' },
      ]},
    ]},
    { num: 2, title: 'Mecánica y programación', lecciones: [
      { num: 2, title: 'Sistemas mecánicos', cuadernos: [] },
      { num: 3, title: 'Programación y algoritmos', cuadernos: [] },
    ]},
  ],
};

/* ── Contenido socrático por cuaderno ── */
const CUADERNO_SESSIONS: Record<string, CuadernoTurns> = {
  mc1: {
    intro: 'Si divides una pizza en 4 trozos iguales y te comes 3, ¿cómo escribirías eso como número? Y más importante: ¿qué te dice ese número sobre lo que queda?',
    followUp: '3/4 exacto. El denominador indica cuántas partes tiene el todo; el numerador, cuántas tienes tú. Ahora dime: ¿crees que 2/4 y 1/2 representan la misma cantidad?',
    closing: 'Bien: son equivalentes. Dividir numerador y denominador por el mismo número no cambia el valor. ¿En qué situación cotidiana te sería útil simplificar una fracción?',
    hints: [
      '¿Cuántas partes tiene la pizza en total?',
      '¿Y cuántas partes te has comido tú?',
      'Una fracción tiene dos números: ¿qué representa cada uno?',
    ],
  },
  hc1: {
    intro: 'El Imperio Romano duró más de 500 años. ¿Cómo crees que algo tan poderoso puede colapsar? ¿Fue un golpe repentino o algo que se fue acumulando?',
    followUp: 'Bien razonado. Si la economía se agota y el ejército pierde cohesión, ¿qué crees que pasa con las fronteras del Imperio?',
    closing: 'Exacto: las presiones externas encuentran un Imperio ya debilitado por dentro. ¿Qué factor te parece más determinante: la crisis interna o las invasiones?',
    hints: ['¿Qué necesita un imperio grande para sostenerse?', '¿Qué problemas internos tenía Roma en el siglo V?', 'Piensa en economía, ejército y política simultáneamente...'],
  },
  bc1: {
    intro: '¿Qué crees que distingue a una bacteria de una célula de tu cuerpo? Piensa en lo más fundamental que puede haber dentro de una célula.',
    followUp: 'Exacto: el núcleo definido. ¿Por qué crees que tener el ADN aislado en un núcleo puede ser una ventaja evolutiva?',
    closing: 'Bien. Permite regular la expresión génica con más precisión. ¿Qué tipo de célula —procariota o eucariota— apareció primero en la evolución y por qué?',
    hints: ['¿Dónde está el ADN en cada tipo de célula?', '¿Cuál tiene membrana nuclear?', 'Piensa en complejidad: ¿cuál es más simple?'],
  },
  ec1: {
    intro: "Look at these two sentences: 'I've studied here for 5 years' and 'I've studied here since 2019.' Both use present perfect — what's the difference between 'for' and 'since'?",
    followUp: "Good. 'For' measures a span of time; 'since' marks a starting point. Quick test: 'She has worked here ___ Monday.' Which word fits and why?",
    closing: "'Since Monday' — because Monday is a point in time, not a duration. Now one more: 'I've known her ___ three years.' Which fits?",
    hints: ["Does 'for' go with a duration or a starting point?", "Does 'since' go with a duration or a point in time?", "Think: is 'Monday' a duration or a specific moment?"],
  },
  tc1: {
    intro: 'La Ley de Ohm dice V = I × R. Si mantienes el voltaje constante y subes la resistencia, ¿qué le pasa a la corriente? Razona antes de responder.',
    followUp: 'Correcto: la corriente baja. Ahora al revés: misma resistencia, ¿qué harías para que circule más corriente?',
    closing: 'Exacto: subir el voltaje. V = I × R es una relación lineal. ¿Puedes pensar en un ejemplo cotidiano donde esto se aplique sin que te des cuenta?',
    hints: ['Despeja I en la ecuación: I = V / R', '¿Qué pasa con I si R sube y V no cambia?', 'Piensa en una bombilla y una pila...'],
  },
};
const DEFAULT_SESSION: CuadernoTurns = {
  intro: 'Empecemos. ¿Qué sabes ya sobre este tema? Cuéntame lo primero que te venga a la mente.',
  followUp: 'Interesante. ¿Puedes dar un ejemplo concreto de lo que acabas de decir?',
  closing: 'Muy bien. Has trabajado el concepto clave de este cuaderno. ¿Qué es lo que más te ha costado entender?',
  hints: [
    'Piensa en algo que ya conozcas sobre el tema...',
    'Intenta relacionarlo con un ejemplo de la vida real...',
    'Simplifica: ¿cuál es la idea más básica aquí?',
  ],
};

/* Pre-populated student responses — two per cuaderno, one per phase */
const PRELOADED_RESPONSES: Record<string, [string, string]> = {
  mc1: [
    'Sería 3/4. Y quedaría 1/4 de pizza.',
    'Sí, creo que sí. Si partes la pizza en 8 y comes 4, tienes 4/8, que es igual a 1/2.',
  ],
  hc1: [
    'Creo que fue algo que se fue acumulando poco a poco. Un imperio tan grande no cae de golpe.',
    'Las fronteras quedarían desprotegidas. Sin ejército cohesionado no se puede defender un territorio tan enorme.',
  ],
  bc1: [
    'La bacteria no tiene núcleo diferenciado, la célula humana sí tiene uno con su propia membrana.',
    'Porque si el ADN está protegido en el núcleo se puede controlar mejor qué genes se activan y cuándo.',
  ],
  ec1: [
    "'For' goes with a duration — like 'for 5 years'. 'Since' marks the starting point — like 'since 2019'.",
    "'Since Monday' — Monday is a specific point in time, not a duration.",
  ],
  tc1: [
    'La corriente tiene que bajar. Es como estrechar una manguera con la misma presión de agua.',
    'Habría que subir el voltaje. Si V sube y R no cambia, I sube también según I = V / R.',
  ],
};

/* ── Weekly activity (demo) ── */
const STREAK = {
  days: 3,
  week: [true, true, true, false, false, false, false] as boolean[],
  weekQuestions: 7,
  dayLabels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
};

/* ── Helpers ── */
const diffStyle = (d: Diff) => {
  if (d === 'Básica')     return { bg: T.successSoft, color: T.success };
  if (d === 'Intermedia') return { bg: T.warnSoft,    color: T.warn };
  return                         { bg: T.dangerSoft,  color: T.danger };
};

/* ── Wordmark SVG (static, compact) ── */
/* Sidebar wordmark — animated, starts expanded, collapses on hover */
function SidebarWordmark({ minimized }: { minimized: boolean }) {
  return (
    <div className={minimized ? 'nav-brand' : 'nav-brand nb-active'} aria-label="Marco" style={{ color: T.black }}>
      <span className="nb-frame">
        <svg className="nb-svg" viewBox="140 70 140 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <line className="nb-l-v"     x1="148" y1="80"  x2="148" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line className="nb-tl-stub" x1="148" y1="80"  x2="207" y2="80"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line className="nb-bl-stub" x1="148" y1="130" x2="207" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <g className="nb-right-group">
            <line className="nb-r-v"     x1="202" y1="80"  x2="202" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line className="nb-tr-stub" x1="202" y1="80"  x2="143" y2="80"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line className="nb-br-stub" x1="202" y1="130" x2="143" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
          <defs>
            <clipPath id="sbArcoClip">
              <rect className="nb-arco-clip" x="190" y="78" width="64" height="54"/>
            </clipPath>
          </defs>
          <g clipPath="url(#sbArcoClip)">
            <text x="190" y="114" className="nb-arco">arco</text>
          </g>
          <text x="175" y="119" className="nb-mark nb-mark-sigma" textAnchor="middle">&#x03A3;</text>
        </svg>
      </span>
    </div>
  );
}

/* ── Wordmark with hover animation — collapsed by default, expands on hover ── */
function NavWordmark({ clipId = 'navArco' }: { clipId?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ zoom: 0.65, lineHeight: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`nav-brand${hovered ? ' nb-active' : ''}`} aria-label="Marco" style={{ color: T.black }}>
        <span className="nb-frame">
          <svg className="nb-svg" viewBox="140 70 140 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line className="nb-l-v"     x1="148" y1="80"  x2="148" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line className="nb-tl-stub" x1="148" y1="80"  x2="207" y2="80"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line className="nb-bl-stub" x1="148" y1="130" x2="207" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <g className="nb-right-group">
              <line className="nb-r-v"     x1="202" y1="80"  x2="202" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line className="nb-tr-stub" x1="202" y1="80"  x2="143" y2="80"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line className="nb-br-stub" x1="202" y1="130" x2="143" y2="130" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </g>
            <defs>
              <clipPath id={clipId}>
                <rect className="nb-arco-clip" x="190" y="78" width="64" height="54"/>
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <text x="190" y="114" className="nb-arco">arco</text>
            </g>
            <text x="175" y="119" className="nb-mark nb-mark-sigma" textAnchor="middle">&#x03A3;</text>
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ── Thematic chat backgrounds — SVG patterns encoded as data URIs ── */
const _svgBg = (svg: string): string =>
  `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const CUADERNO_CHAT_STYLE: Record<string, React.CSSProperties> = {
  mc1: { /* Matemáticas — símbolos matemáticos flotando */
    backgroundColor: '#f7f7fc',
    backgroundImage: _svgBg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">` +
      `<text x="14" y="36" font-family="Georgia,serif" font-size="22" fill="rgba(99,102,204,0.14)" transform="rotate(-10 14 36)">π</text>` +
      `<text x="95" y="22" font-family="Georgia,serif" font-size="17" fill="rgba(99,102,204,0.11)">∑</text>` +
      `<text x="156" y="58" font-family="Georgia,serif" font-size="18" fill="rgba(99,102,204,0.12)">√2</text>` +
      `<text x="32" y="90" font-family="Georgia,serif" font-size="14" fill="rgba(99,102,204,0.10)">x²</text>` +
      `<text x="118" y="102" font-family="Georgia,serif" font-size="20" fill="rgba(99,102,204,0.13)">∫</text>` +
      `<text x="62" y="132" font-family="Georgia,serif" font-size="21" fill="rgba(99,102,204,0.11)" transform="rotate(5 62 132)">∞</text>` +
      `<text x="154" y="150" font-family="Georgia,serif" font-size="14" fill="rgba(99,102,204,0.10)">Δx</text>` +
      `<text x="18" y="172" font-family="Georgia,serif" font-size="17" fill="rgba(99,102,204,0.12)" transform="rotate(-8 18 172)">θ</text>` +
      `<text x="90" y="186" font-family="Georgia,serif" font-size="15" fill="rgba(99,102,204,0.10)">≠</text>` +
      `<text x="168" y="194" font-family="Georgia,serif" font-size="13" fill="rgba(99,102,204,0.11)">±</text>` +
      `</svg>`
    ),
    backgroundSize: '200px 200px',
  },

  hc1: { /* Historia — pergamino con numeración romana */
    backgroundColor: '#fdf4d8',
    backgroundImage: [
      'radial-gradient(ellipse at 0% 0%, rgba(160,110,40,0.12) 0%, transparent 45%)',
      'radial-gradient(ellipse at 100% 100%, rgba(140,95,30,0.10) 0%, transparent 45%)',
      _svgBg(
        `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">` +
        `<text x="18" y="42" font-family="Georgia,serif" font-size="16" fill="rgba(146,64,14,0.12)" transform="rotate(-5 18 42)">MCMXIV</text>` +
        `<text x="118" y="26" font-family="Georgia,serif" font-size="20" fill="rgba(146,64,14,0.10)">SPQR</text>` +
        `<text x="165" y="84" font-family="Georgia,serif" font-size="14" fill="rgba(146,64,14,0.11)" transform="rotate(8 165 84)">CDLXXVI</text>` +
        `<text x="14" y="114" font-family="Georgia,serif" font-size="18" fill="rgba(146,64,14,0.10)">MMXXIV</text>` +
        `<text x="100" y="138" font-family="Georgia,serif" font-size="22" fill="rgba(146,64,14,0.09)" transform="rotate(-3 100 138)">I · V · X</text>` +
        `<text x="160" y="168" font-family="Georgia,serif" font-size="16" fill="rgba(146,64,14,0.11)">LXX</text>` +
        `<text x="26" y="194" font-family="Georgia,serif" font-size="14" fill="rgba(146,64,14,0.10)" transform="rotate(4 26 194)">CCCXLIV</text>` +
        `<text x="104" y="214" font-family="Georgia,serif" font-size="16" fill="rgba(146,64,14,0.09)">DCCCLXII</text>` +
        `</svg>`
      ),
    ].join(', '),
    backgroundSize: '100% 100%, 100% 100%, 220px 220px',
  },

  bc1: { /* Biología — células con núcleo */
    backgroundColor: '#f1faf4',
    backgroundImage: _svgBg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110">` +
      `<ellipse cx="30" cy="28" rx="21" ry="18" fill="none" stroke="rgba(16,185,129,0.14)" stroke-width="1.2"/>` +
      `<circle cx="30" cy="28" r="6" fill="rgba(16,185,129,0.10)" stroke="rgba(16,185,129,0.16)" stroke-width="0.8"/>` +
      `<ellipse cx="78" cy="24" rx="18" ry="22" fill="none" stroke="rgba(16,185,129,0.12)" stroke-width="1.2" transform="rotate(15 78 24)"/>` +
      `<circle cx="78" cy="24" r="5" fill="rgba(16,185,129,0.09)" stroke="rgba(16,185,129,0.14)" stroke-width="0.8"/>` +
      `<ellipse cx="24" cy="76" rx="23" ry="17" fill="none" stroke="rgba(16,185,129,0.13)" stroke-width="1.2" transform="rotate(-10 24 76)"/>` +
      `<circle cx="24" cy="76" r="7" fill="rgba(16,185,129,0.10)" stroke="rgba(16,185,129,0.16)" stroke-width="0.8"/>` +
      `<ellipse cx="78" cy="80" rx="19" ry="22" fill="none" stroke="rgba(16,185,129,0.11)" stroke-width="1.2" transform="rotate(8 78 80)"/>` +
      `<circle cx="78" cy="80" r="5" fill="rgba(16,185,129,0.09)" stroke="rgba(16,185,129,0.14)" stroke-width="0.8"/>` +
      `</svg>`
    ),
    backgroundSize: '110px 110px',
  },

  ec1: { /* Inglés — cuaderno rayado con margen */
    backgroundColor: '#f4f8ff',
    backgroundImage: _svgBg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="28">` +
      `<line x1="0" y1="27.5" x2="360" y2="27.5" stroke="rgba(59,130,246,0.13)" stroke-width="1"/>` +
      `<line x1="44" y1="0" x2="44" y2="28" stroke="rgba(220,80,80,0.10)" stroke-width="1"/>` +
      `</svg>`
    ),
    backgroundSize: '360px 28px',
  },

  tc1: { /* Tecnología — trazado de circuito impreso */
    backgroundColor: '#f2f9fd',
    backgroundImage: _svgBg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">` +
      `<line x1="0" y1="25" x2="38" y2="25" stroke="rgba(14,165,233,0.14)" stroke-width="1.5"/>` +
      `<line x1="62" y1="25" x2="100" y2="25" stroke="rgba(14,165,233,0.14)" stroke-width="1.5"/>` +
      `<line x1="0" y1="75" x2="28" y2="75" stroke="rgba(14,165,233,0.12)" stroke-width="1.5"/>` +
      `<line x1="72" y1="75" x2="100" y2="75" stroke="rgba(14,165,233,0.12)" stroke-width="1.5"/>` +
      `<line x1="25" y1="0" x2="25" y2="13" stroke="rgba(14,165,233,0.14)" stroke-width="1.5"/>` +
      `<line x1="25" y1="37" x2="25" y2="100" stroke="rgba(14,165,233,0.14)" stroke-width="1.5"/>` +
      `<line x1="75" y1="0" x2="75" y2="63" stroke="rgba(14,165,233,0.12)" stroke-width="1.5"/>` +
      `<line x1="75" y1="87" x2="75" y2="100" stroke="rgba(14,165,233,0.12)" stroke-width="1.5"/>` +
      `<circle cx="25" cy="25" r="4" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.22)" stroke-width="1.5"/>` +
      `<circle cx="75" cy="75" r="4" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.20)" stroke-width="1.5"/>` +
      `<rect x="44" y="43" width="12" height="8" rx="1" fill="rgba(14,165,233,0.06)" stroke="rgba(14,165,233,0.16)" stroke-width="1"/>` +
      `<line x1="44" y1="46" x2="40" y2="46" stroke="rgba(14,165,233,0.14)" stroke-width="1"/>` +
      `<line x1="44" y1="50" x2="40" y2="50" stroke="rgba(14,165,233,0.14)" stroke-width="1"/>` +
      `<line x1="56" y1="46" x2="60" y2="46" stroke="rgba(14,165,233,0.14)" stroke-width="1"/>` +
      `<line x1="56" y1="50" x2="60" y2="50" stroke="rgba(14,165,233,0.14)" stroke-width="1"/>` +
      `</svg>`
    ),
    backgroundSize: '100px 100px',
  },
};

/* ── Marco brand avatar — rounded square with [Σ] brackets ── */
function MarcoAvatar({ size = 26 }: { size?: number }) {
  const r    = 0;                                // perfect square
  const pad  = Math.round(size * 0.11);          // bar distance from edge
  const stub = Math.round(size * 0.15);          // stub length — short so Σ breathes
  const sw   = Math.max(0.9, size * 0.044);      // stroke ~1.1 px at size 26
  const y1 = pad, y2 = size - pad;
  const lx = pad, rx = size - pad;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: T.violet,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative',
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        fill="none" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <line x1={lx} y1={y1} x2={lx}      y2={y2} stroke={T.deep} strokeWidth={sw} strokeLinecap="round"/>
        <line x1={lx} y1={y1} x2={lx+stub} y2={y1} stroke={T.deep} strokeWidth={sw} strokeLinecap="round"/>
        <line x1={lx} y1={y2} x2={lx+stub} y2={y2} stroke={T.deep} strokeWidth={sw} strokeLinecap="round"/>
        <line x1={rx} y1={y1} x2={rx}      y2={y2} stroke={T.deep} strokeWidth={sw} strokeLinecap="round"/>
        <line x1={rx} y1={y1} x2={rx-stub} y2={y1} stroke={T.deep} strokeWidth={sw} strokeLinecap="round"/>
        <line x1={rx} y1={y2} x2={rx-stub} y2={y2} stroke={T.deep} strokeWidth={sw} strokeLinecap="round"/>
      </svg>
      <span style={{
        position: 'relative', zIndex: 1,
        fontFamily: "'Fraunces', Georgia, serif",
        fontWeight: 500,
        fontSize: `${Math.round(size * 0.54)}px`,
        fontVariationSettings: '"opsz" 96',
        color: T.deep, lineHeight: 1, userSelect: 'none',
        transform: 'translateY(0.8px)',
        display: 'inline-block',
      } as React.CSSProperties}>Σ</span>
    </div>
  );
}

/* ── Browser Chrome wrapper ── */
function BrowserChrome({ children, leaving = false }: { children: React.ReactNode; leaving?: boolean }) {
  return (
    <motion.div
      className="bc-outer"
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: leaving ? 0.26 : 0.2 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg, #d4d3d0 0%, #c8c7c4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <motion.div
        className="bc-inner"
        initial={{ y: 12, opacity: 0 }}
        animate={leaving ? { y: 18, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: leaving ? 0.2 : 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: '1080px',
          height: 'calc(100vh - 4rem)',
          maxHeight: '720px',
          background: T.white,
          borderRadius: '12px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Chrome top bar */}
        <div className="bc-bar" style={{
          background: '#ebebeb', borderBottom: '1px solid #d0d0d0',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          flexShrink: 0,
        }}>
          {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
          <div style={{
            flex: 1, maxWidth: '420px', margin: '0 auto',
            background: '#ffffff', border: '1px solid #c8c8c8',
            borderRadius: '6px', padding: '4px 12px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <rect x="1" y="5" width="8" height="7" rx="1.5" fill="#6b6b6b"/>
              <path d="M2.5 5V3.5a2.5 2.5 0 015 0V5" stroke="#6b6b6b" strokeWidth="1.2" fill="none"/>
            </svg>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#3c3c3c' }}>
              app.marcoaprende.com
            </span>
          </div>
        </div>

        {/* App viewport */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: T.bg }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── App Navbar ── */
function AppNavbar({
  onBack, backLabel, title, right, onMenuToggle,
}: {
  onBack?: () => void; backLabel?: string; title?: string; right?: React.ReactNode;
  onMenuToggle?: () => void;
}) {
  return (
    <div style={{
      background: T.white, borderBottom: `1px solid ${T.border}`,
      padding: '0 1.25rem',
      display: 'flex', alignItems: 'center',
      height: '50px', flexShrink: 0, position: 'relative',
    }}>
      {/* Left */}
      {onBack ? (
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
          color: T.soft, padding: '4px 0', transition: 'color 0.12s', zIndex: 1,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = T.black)}
        onMouseLeave={e => (e.currentTarget.style.color = T.soft)}
        >
          <ArrowLeft size={14} />
          {backLabel}
        </button>
      ) : (
        <button onClick={onMenuToggle} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '7px', borderRadius: '8px', display: 'flex',
          color: T.black, transition: 'background 0.12s', zIndex: 1,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = T.note)}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>
      )}
      {/* Centered title */}
      {title && (
        <p style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic',
          fontVariationSettings: '"opsz" 72',
          fontSize: '0.9375rem', fontWeight: 500, color: T.black,
          letterSpacing: '-0.02em', margin: 0, pointerEvents: 'none',
        }}>
          {title}
        </p>
      )}
      {/* Right */}
      <div style={{ marginLeft: 'auto', zIndex: 1 }}>{right}</div>
    </div>
  );
}

/* ── Sidebar ── */
function Sidebar({ open, onClose, onLogout }: { open: boolean; onClose: () => void; onLogout: () => void }) {
  const navItems = [
    { label: 'Inicio',          icon: Home,      active: true  },
    { label: 'Mis cuadernos',   icon: BookOpen,  active: false },
    { label: 'Mi progreso',     icon: TrendingUp,active: false },
    { label: 'Estadísticas',    icon: BarChart2, active: false },
  ];
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="sb-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.16)', zIndex: 100 }}
          />
          <motion.div
            key="sb-panel"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: '220px', zIndex: 101,
              background: T.white, borderRight: `1px solid ${T.border}`,
              boxShadow: '4px 0 28px rgba(0,0,0,0.09)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 0.875rem',
              height: '50px', flexShrink: 0,
              borderBottom: `1px solid ${T.borderSoft}`,
            }}>
              <button onClick={onClose} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: T.soft, padding: '7px', borderRadius: '8px',
                display: 'flex', transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.note; e.currentTarget.style.color = T.black; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.soft; }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <NavWordmark clipId="sbHeaderArco" />
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '0.5rem 0.625rem', overflowY: 'auto' }}>
              {navItems.map(({ label, icon: Icon, active }) => (
                <button key={label} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem', borderRadius: '10px',
                  background: active ? T.violet : 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
                  fontWeight: active ? 500 : 400,
                  color: active ? T.deep : T.gray,
                  textAlign: 'left', transition: 'background 0.12s, color 0.12s',
                  marginBottom: '2px',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.note; e.currentTarget.style.color = T.black; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.gray; } }}
                >
                  <Icon size={15} strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Profile */}
            <div style={{ padding: '0.875rem', borderTop: `1px solid ${T.borderSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontSize: '0.875rem', color: T.deep }}>A</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500, color: T.black, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Alex García</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, margin: 0 }}>3.º ESO</p>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.soft, display: 'flex', padding: '4px', borderRadius: '6px', transition: 'background 0.12s, color 0.12s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.background = T.note; e.currentTarget.style.color = T.gray; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.soft; }}
                >
                  <Settings size={14} strokeWidth={1.75} />
                </button>
              </div>
              <button onClick={onLogout} style={{
                width: '100%', padding: '0.4rem 0.75rem',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.danger,
                background: 'none', border: 'none', cursor: 'pointer',
                borderRadius: '8px', textAlign: 'left', transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.dangerSoft)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ══════════════ SCREENS ══════════════ */

/* ── Streak widget ── */
function StreakWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: 0.32 }}
      style={{
        background: T.note, borderRadius: '14px',
        padding: '0.875rem 1rem',
        marginTop: '0.875rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.125rem', fontWeight: 600, color: T.black, margin: 0, lineHeight: 1 }}>
            {STREAK.days}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft, margin: '2px 0 0' }}>
            días seguidos
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.125rem', fontWeight: 600, color: T.black, margin: 0, lineHeight: 1 }}>
            {STREAK.weekQuestions}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft, margin: '2px 0 0' }}>
            preguntas esta semana
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {STREAK.week.map((done, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            <div style={{
              width: '100%', height: '6px', borderRadius: '2px',
              background: done ? T.accent : T.borderSoft,
              opacity: done ? 1 : 0.6,
            }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', color: done ? T.soft : T.borderSoft, fontWeight: done ? 500 : 400 }}>
              {STREAK.dayLabels[i]}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const HOOK_QUESTIONS = [
  '¿Sabes algo o simplemente lo recuerdas?',
  '¿Se puede aprender sin equivocarse?',
  '¿Entender es lo mismo que memorizar?',
  '¿Tienes una opinión o un argumento?',
  '¿Cuándo fue la última vez que cambiaste de idea?',
];

/* Loading → hook question */
function LoadingScreen() {
  const [q] = useState(() => HOOK_QUESTIONS[Math.floor(Math.random() * HOOK_QUESTIONS.length)]);
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: '440px', textAlign: 'center' }}
      >
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontStyle: 'italic',
          fontVariationSettings: '"opsz" 72',
          fontSize: '1.35rem', fontWeight: 500,
          color: T.black, lineHeight: 1.5,
          letterSpacing: '-0.025em',
          margin: '0 0 1.25rem',
        }}>
          {q}
        </p>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.soft, letterSpacing: '0.02em' }}>
          Cargando…
        </span>
      </motion.div>
    </div>
  );
}

/* Home */
function HomeScreen({ subjects, onSelect, logout }: { subjects: Subject[]; onSelect: (s: Subject) => void; logout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const CARD_SPRING = { type: 'spring' as const, stiffness: 500, damping: 32 };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />
      <AppNavbar onMenuToggle={() => setSidebarOpen(s => !s)} right={<NavWordmark clipId="navbarArco" />} />

      <div className="mobile-stack" style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ── Left: Subjects ── */}
        <div className="panel-left" style={{ flex: '0 0 58%', overflowY: 'auto', padding: '1.125rem 1rem 1.125rem 1.25rem', borderRight: `1px solid ${T.borderSoft}` }}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.68rem', fontWeight: 600,
              color: T.soft, textTransform: 'uppercase', letterSpacing: '0.07em',
              margin: '0 0 0.75rem',
            }}>
              Asignaturas
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {subjects.map((s) => {
                const colors = SC(s.id);
                const pct = Math.round((s.completed / s.total) * 100);
                return (
                  <motion.button
                    key={s.id}
                    onClick={() => onSelect(s)}
                    whileHover={{ y: -2, boxShadow: `0 5px 18px ${colors.progress}28` }}
                    whileTap={{ scale: 0.975 }}
                    transition={CARD_SPRING}
                    style={{
                      background: T.white, border: `1.5px solid ${T.border}`,
                      borderRadius: '14px', padding: '0.8125rem',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.background = colors.hover;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.background = T.white;
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: T.black, margin: 0, lineHeight: 1.2 }}>{s.name}</p>
                      {(() => { const Icon = SUBJECT_ICONS[s.id]; return (
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '7px',
                          background: colors.pill,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginLeft: '0.375rem',
                        }}>
                          {Icon && <Icon size={13} color={colors.color} strokeWidth={1.75} />}
                        </div>
                      ); })()}
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft, margin: '0 0 0.5rem', lineHeight: 1.3 }}>
                      {s.topic}
                    </p>
                    <div style={{ height: '3px', background: T.borderSoft, borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? T.success : colors.progress, borderRadius: '9999px' }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Right: Assigned notebooks ── */}
        <div className="panel-right" style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.125rem 1.25rem 0.5rem 1rem' }}>
          <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.68rem', fontWeight: 600,
              color: T.soft, textTransform: 'uppercase', letterSpacing: '0.07em',
              margin: '0 0 0.75rem',
            }}>
              Cuadernos de trabajo
            </p>

            {/* Card 1: Nuevo */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.12 }}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
              style={{
                background: T.white, borderRadius: '14px', padding: '0.75rem 0.875rem',
                border: `1.5px solid ${T.accent}`,
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                marginBottom: '0.5rem', cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onClick={() => { const s = subjects.find(x => x.id === 'mates'); if (s) onSelect(s); }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = T.deep; e.currentTarget.style.boxShadow = `0 4px 14px ${T.accent}22`; }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clipboard size={15} color="#1d4ed8" strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2px', flexWrap: 'nowrap' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, color: T.black, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Reto de Geometría — U2
                  </p>
                  <span style={{ background: T.danger, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, padding: '1px 5px', borderRadius: '9999px', letterSpacing: '0.06em', flexShrink: 0 }}>
                    NUEVO
                  </span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft, margin: 0 }}>
                  Prof. Marcos · Matemáticas
                </p>
              </div>
              <button style={{ background: T.deep, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 500, padding: '0.3rem 0.7rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                Empezar
              </button>
            </motion.div>

            {/* Card 2: En progreso */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.18 }}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
              style={{
                background: T.white, borderRadius: '14px', padding: '0.75rem 0.875rem',
                border: `1.5px solid ${T.border}`,
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                marginBottom: '0.5rem', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onClick={() => { const s = subjects.find(x => x.id === 'lengua'); if (s) onSelect(s); }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = T.soft)}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = T.border)}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={15} color="#1d4ed8" strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, color: T.black, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Redacción: Mi lugar favorito
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft, margin: 0 }}>
                  Profa. Laura · Lengua · <span style={{ color: T.warn, fontWeight: 500 }}>Vence mañana</span>
                </p>
              </div>
              <button style={{ background: '#f1f5f9', color: T.gray, fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 500, padding: '0.3rem 0.7rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                Continuar
              </button>
            </motion.div>

            {/* Card 3: Completado */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.24 }}
              style={{
                background: T.white, borderRadius: '14px', padding: '0.75rem 0.875rem',
                border: `1.5px solid ${T.borderSoft}`,
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                opacity: 0.58,
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={15} color="#94a3b8" strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600, color: T.gray, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Cuestionario: Ecosistemas
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft, margin: 0 }}>
                  Prof. Carlos · Ciencias · Completado
                </p>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: T.soft, textDecoration: 'underline', cursor: 'pointer', flexShrink: 0 }}>
                Revisar
              </span>
            </motion.div>

          </motion.div>
          </div>
          {/* Streak pinned to bottom */}
          <div style={{ padding: '0 1.25rem 1rem 1rem', flexShrink: 0 }}>
            <StreakWidget />
          </div>
        </div>

      </div>
    </div>
  );
}

/* Subject */
function SubjectScreen({
  subject, onBack, onOpenCuaderno,
}: { subject: Subject; onBack: () => void; onOpenCuaderno: (c: Cuaderno, l: Leccion) => void }) {
  const colors = SC(subject.id);
  const SubjectIcon = SUBJECT_ICONS[subject.id];
  const bloques = BLOQUES[subject.id] ?? [];
  const [selectedBloqueIdx, setSelectedBloqueIdx] = useState<number>(0);

  const totalCuadernos = bloques.reduce((n, b) => n + b.lecciones.reduce((m, l) => m + l.cuadernos.length, 0), 0);
  const realizados = bloques.reduce((n, b) => n + b.lecciones.reduce((m, l) => m + l.cuadernos.filter(c => c.intentos > 0).length, 0), 0);
  const selectedBloque = bloques[selectedBloqueIdx] ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AppNavbar
        onBack={onBack} backLabel="Inicio"
        title={subject.name}
        right={
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.soft }}>
            {realizados}/{totalCuadernos} cuadernos
          </span>
        }
      />

      {/* Two-panel body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* Left: bloques */}
        <div style={{
          width: '36%', flexShrink: 0,
          borderRight: `1px solid ${T.border}`,
          overflowY: 'auto',
          background: T.white,
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22 }}
            style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 0' }}
          >
            {bloques.map((bloque, bi) => {
              const isActive = bi === selectedBloqueIdx;
              const bTotal = bloque.lecciones.reduce((n, l) => n + l.cuadernos.length, 0);
              const bDone = bloque.lecciones.reduce((n, l) => n + l.cuadernos.filter(c => c.intentos > 0).length, 0);
              return (
                <button
                  key={bloque.num}
                  onClick={() => setSelectedBloqueIdx(bi)}
                  style={{
                    background: isActive ? colors.pill : 'none',
                    border: 'none',
                    borderLeft: `3px solid ${isActive ? colors.color : 'transparent'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '0.75rem 1rem 0.75rem 0.875rem',
                    transition: 'background 0.14s, border-color 0.14s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = colors.pill + '70'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 700,
                      color: isActive ? colors.color : T.soft,
                      background: isActive ? colors.hover : T.borderSoft,
                      padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.05em',
                      flexShrink: 0,
                    }}>
                      B{bloque.num}
                    </span>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? T.black : T.gray,
                      margin: 0, lineHeight: 1.3,
                    }}>
                      {bloque.title}
                    </p>
                  </div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem',
                    color: isActive ? colors.color : T.soft,
                    margin: 0, paddingLeft: '1.75rem',
                  }}>
                    {bloque.lecciones.length} lección{bloque.lecciones.length !== 1 ? 'es' : ''}
                    {bTotal > 0 && ` · ${bDone}/${bTotal} cuad.`}
                  </p>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Right: lecciones + ejercicios */}
        <div style={{ flex: 1, overflowY: 'auto', background: T.bg }}>
          <AnimatePresence mode="wait">
            {selectedBloque && (
              <motion.div
                key={selectedBloqueIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: '1rem 1.125rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Bloque header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '9px', background: colors.pill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {SubjectIcon && <SubjectIcon size={15} color={colors.color} strokeWidth={1.7} />}
                  </div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: colors.color, margin: 0, letterSpacing: '0.05em' }}>
                      BLOQUE {selectedBloque.num}
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: T.black, margin: 0 }}>
                      {selectedBloque.title}
                    </p>
                  </div>
                </div>

                {/* Lecciones */}
                {selectedBloque.lecciones.map((leccion, li) => (
                  <motion.div
                    key={leccion.num}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: li * 0.05 }}
                  >
                    {/* Leccion header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.625rem' }}>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 700,
                        color: colors.color, background: colors.pill,
                        padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.04em', flexShrink: 0,
                      }}>
                        L{leccion.num}
                      </span>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500, color: T.black, margin: 0 }}>
                        {leccion.title}
                      </p>
                    </div>

                    {/* Cuadernos */}
                    {leccion.cuadernos.length === 0 ? (
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem',
                        color: T.soft, margin: '0 0 0 1.5rem',
                        fontStyle: 'italic',
                      }}>
                        El profesor aún no ha añadido cuadernos
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {leccion.cuadernos.map((c, ci) => {
                          const isTeoria = c.tipo === 'teoria';
                          const tipoBg    = isTeoria ? T.violet  : '#fff7ed';
                          const tipoColor = isTeoria ? T.accent  : '#c2410c';
                          const tipoLabel = isTeoria ? 'Teoría'  : 'Práctica';
                          return (
                            <motion.div
                              key={c.id}
                              initial={{ opacity: 0, y: 3 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.16, delay: li * 0.05 + ci * 0.04 }}
                              style={{
                                background: T.white,
                                border: `1.5px solid ${c.intentos > 0 ? T.borderSoft : T.border}`,
                                borderRadius: '12px',
                                padding: '0.7rem 0.875rem',
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '3px' }}>
                                  <span style={{
                                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 700,
                                    background: tipoBg, color: tipoColor,
                                    padding: '1px 6px', borderRadius: '4px',
                                    letterSpacing: '0.04em', flexShrink: 0,
                                  }}>
                                    {tipoLabel}
                                  </span>
                                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', fontWeight: 500, color: T.black, margin: 0, lineHeight: 1.3 }}>
                                    {c.title}
                                  </p>
                                </div>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.soft, margin: 0 }}>
                                  {c.intentos === 0
                                    ? 'Sin intentos todavía'
                                    : `${c.intentos} intento${c.intentos !== 1 ? 's' : ''} realizados`}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => onOpenCuaderno(c, leccion)}
                                style={{
                                  flexShrink: 0,
                                  background: c.intentos === 0 ? colors.color : 'none',
                                  color: c.intentos === 0 ? '#fff' : colors.color,
                                  border: `1.5px solid ${colors.color}`,
                                  borderRadius: '8px',
                                  padding: '0.3rem 0.75rem',
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: '0.72rem', fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'opacity 0.12s',
                                }}
                              >
                                {c.intentos === 0 ? 'Empezar' : 'Repetir'}
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

/* Chat */
function ChatScreen({
  subject, question, onBack, onComplete,
}: { subject: Subject; question: Question; onBack: () => void; onComplete: () => void }) {
  const colors = SC(subject.id);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'marco', text: question.socrático },
  ]);
  const [input, setInput] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [phase, setPhase] = useState(0); // 0=waiting, 1=after1st, 2=done
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    pushMessage(subject.id, { role: 'marco', text: question.socrático });
    pushActivity({ studentName: 'Alex García', studentInitials: 'AG', subject: subject.name, subjectKey: subject.id, action: `Abrió "${question.preview}"` });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = () => {
    if (!input.trim() || typing) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'student', text }]);
    pushMessage(subject.id, { role: 'student', text });
    pushActivity({
      studentName: 'Alex García',
      studentInitials: 'AG',
      subject: subject.name,
      subjectKey: subject.id,
      action: text.length > 60 ? text.slice(0, 60) + '…' : text,
    });
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      if (phase === 0) {
        setMessages(prev => [...prev, { role: 'marco', text: question.followUp }]);
        pushMessage(subject.id, { role: 'marco', text: question.followUp });
        setPhase(1);
      } else {
        setMessages(prev => [...prev, { role: 'marco', text: question.praise }]);
        pushMessage(subject.id, { role: 'marco', text: question.praise });
        setPhase(2);
      }
    }, 650);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <AppNavbar
        onBack={onBack} backLabel={subject.name}
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MarcoAvatar size={22} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: T.gray }}>Marco</span>
          </div>
        }
      />

      {/* Question context strip */}
      <div style={{ padding: '0.75rem 1.25rem', background: T.violet2, borderBottom: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.soft, margin: '0 0 2px' }}>Contexto</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem', color: T.gray, margin: 0 }}>{question.context}</p>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                justifyContent: m.role === 'student' ? 'flex-end' : 'flex-start',
                gap: '8px',
              }}
            >
              {m.role === 'marco' && (
                <div style={{ marginTop: 2 }}><MarcoAvatar size={28} /></div>
              )}
              <div style={{
                maxWidth: '72%',
                padding: '0.75rem 1rem',
                borderRadius: m.role === 'marco' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                background: m.role === 'marco' ? T.white : colors.progress,
                border: m.role === 'marco' ? `1.5px solid ${T.border}` : 'none',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
                color: m.role === 'marco' ? T.black : T.white,
                lineHeight: 1.55,
              }}>
                {m.text}
              </div>
            </motion.div>
          ))}

          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <MarcoAvatar size={28} />
              <div style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: '4px 16px 16px 16px', padding: '0.75rem 1rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <motion.div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: T.soft }}
                    animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18, ease: 'easeInOut' }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Hints */}
      {phase < 2 && (
        <div style={{ padding: '0.5rem 1.25rem', background: T.white, borderTop: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Lightbulb size={11} /> Pistas:
            </span>
            {question.hints.map((h, i) => (
              <button key={i} onClick={() => setHintLevel(i + 1)} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem',
                background: hintLevel > i ? T.violet : T.note,
                color: hintLevel > i ? T.deep : T.soft,
                border: 'none', borderRadius: '9999px',
                padding: '2px 8px', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {hintLevel > i ? h : `Pista ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input / Done */}
      <div style={{ padding: '0.875rem 1.25rem', background: T.white, borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
        {phase < 2 ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Escribe tu respuesta..."
              autoFocus
              style={{
                flex: 1, padding: '0.625rem 0.875rem',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem',
                color: T.black, background: T.bg,
                border: `1.5px solid ${T.border}`, borderRadius: '9999px',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = T.accent)}
              onBlur={e => (e.target.style.borderColor = T.border)}
            />
            <button
              onClick={send}
              disabled={!input.trim() || typing}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: input.trim() && !typing ? T.deep : T.borderSoft,
                border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <Send size={15} color={input.trim() && !typing ? '#fff' : T.soft} />
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: '0.75rem' }}
          >
            <button onClick={onBack} style={{
              flex: 1, padding: '0.625rem',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500,
              background: T.note, color: T.gray,
              border: `1.5px solid ${T.border}`, borderRadius: '9999px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            }}>
              <RotateCcw size={13} /> Volver a preguntas
            </button>
            <button onClick={onComplete} style={{
              flex: 1, padding: '0.625rem',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', fontWeight: 500,
              background: T.deep, color: '#fff',
              border: 'none', borderRadius: '9999px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            }}>
              <CheckCircle2 size={13} /> Marcar como hecha
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* Cuaderno */
function CuadernoScreen({
  subject, cuaderno, leccion, intentoNum, onBack,
}: {
  subject: Subject; cuaderno: Cuaderno; leccion: Leccion;
  intentoNum: number; onBack: () => void;
}) {
  const colors = SC(subject.id);
  const session = CUADERNO_SESSIONS[cuaderno.id] ?? DEFAULT_SESSION;
  const isTeoria = cuaderno.tipo === 'teoria';
  const tipoBg    = isTeoria ? T.violet  : '#fff7ed';
  const tipoColor = isTeoria ? T.accent  : '#c2410c';
  const tipoLabel = isTeoria ? 'Teoría'  : 'Práctica';
  const D = {
    bg: '#16171d', surface: '#1e2029', border: '#2a2b35',
    text: '#e4e4e6', muted: '#5a5b68', accent: '#7c7fff',
  };

  const preResponses = PRELOADED_RESPONSES[cuaderno.id];
  const hasPreload = !!preResponses;
  const initMessages: Msg[] = hasPreload ? [
    { role: 'marco',   text: session.intro     },
    { role: 'student', text: preResponses[0]   },
    { role: 'marco',   text: session.followUp  },
    { role: 'student', text: preResponses[1]   },
    { role: 'marco',   text: session.closing   },
  ] : [{ role: 'marco', text: session.intro }];

  const [messages, setMessages] = useState<Msg[]>(initMessages);
  const [input, setInput] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [phase, setPhase] = useState(hasPreload ? 2 : 0);
  const [typing, setTyping] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selStart, setSelStart] = useState<{ x: number; y: number } | null>(null);
  const [selEnd, setSelEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const docAreaRef = useRef<HTMLDivElement>(null);
  const isFirstScroll = useRef(true);

  useEffect(() => {
    const behavior = isFirstScroll.current ? ('instant' as ScrollBehavior) : 'smooth';
    isFirstScroll.current = false;
    bottomRef.current?.scrollIntoView({ behavior });
  }, [messages, typing]);

  useEffect(() => {
    pushMessage(subject.id, { role: 'marco', text: session.intro });
    pushActivity({
      studentName: 'Alex García', studentInitials: 'AG',
      subject: subject.name, subjectKey: subject.id,
      action: `Abrió cuaderno "${cuaderno.title}"`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!docAreaRef.current) return;
      const rect = docAreaRef.current.getBoundingClientRect();
      setSelEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isDragging]);

  const send = () => {
    if (!input.trim() || typing) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'student', text }]);
    pushMessage(subject.id, { role: 'student', text });
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = phase === 0 ? session.followUp : session.closing;
      setMessages(prev => [...prev, { role: 'marco', text: reply }]);
      pushMessage(subject.id, { role: 'marco', text: reply });
      setPhase(p => p + 1);
    }, 650);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* Navbar */}
      <AppNavbar
        onBack={onBack} backLabel={subject.name}
        title={cuaderno.title}
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 600,
              color: colors.color, background: colors.pill,
              padding: '2px 8px', borderRadius: '9999px',
            }}>
              Intento {intentoNum}
            </span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem',
              color: T.soft,
            }}>
              23 min
            </span>
          </div>
        }
      />

      {/* Info strip */}
      <div style={{
        padding: '0.4rem 1.25rem',
        background: T.white, borderBottom: `1px solid ${T.borderSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 700,
            background: tipoBg, color: tipoColor,
            padding: '1px 7px', borderRadius: '4px', letterSpacing: '0.04em',
          }}>
            {tipoLabel}
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.soft }}>
            L{leccion.num} · {leccion.title}
          </span>
        </div>
        <button
          onClick={() => setNotesOpen(n => !n)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '6px', cursor: 'pointer',
            background: notesOpen ? T.violet : 'none',
            border: notesOpen ? `1px solid ${T.accent}50` : `1px solid ${T.borderSoft}`,
            color: notesOpen ? T.accent : T.soft,
            transition: 'all 0.15s',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 600,
          }}
        >
          <Clipboard size={12} strokeWidth={2} />
          Notas
        </button>
      </div>

      {/* ── 3-column body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT: Document viewer ── */}
        <div style={{
          width: notesOpen ? '47%' : '62%', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: '#dddcda',
          borderRight: `1px solid ${T.border}`,
          transition: 'width 0.18s ease',
          overflow: 'hidden',
        }}>
          {/* PDF Toolbar */}
          <div style={{
            background: '#edece8', borderBottom: '1px solid #c8c7c3',
            padding: '0.35rem 0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            flexShrink: 0,
          }}>
            <div style={{
              background: '#c0392b', color: '#fff',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.5rem', fontWeight: 800,
              padding: '1px 5px', borderRadius: '3px', letterSpacing: '0.07em', flexShrink: 0,
            }}>PDF</div>
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', color: '#7a7a76', flexShrink: 0 }}>
              Pág 1 / 1
            </span>
            <div style={{ width: 1, height: 13, background: '#c8c7c3', flexShrink: 0 }} />
            <button
              onClick={() => {
                setSelectionMode(s => {
                  if (s) { setSelStart(null); setSelEnd(null); setIsDragging(false); }
                  return !s;
                });
              }}
              title={selectionMode ? 'Desactivar selección' : 'Marcar fragmento'}
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                padding: '3px 8px', borderRadius: '5px', cursor: 'pointer', flexShrink: 0,
                background: selectionMode ? T.deep : 'none',
                border: selectionMode ? 'none' : '1px solid #c8c7c3',
                color: selectionMode ? '#fff' : '#6b6b6b',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              <MousePointer2 size={11} strokeWidth={2} />
              {selectionMode ? 'Marcando…' : 'Marcar'}
            </button>
          </div>

          {/* Page scroll area */}
          <div
            ref={docAreaRef}
            onMouseDown={selectionMode ? (e) => {
              e.preventDefault();
              const rect = docAreaRef.current!.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setSelStart({ x, y });
              setSelEnd({ x, y });
              setIsDragging(true);
            } : undefined}
            style={{
              flex: 1, overflowY: 'auto', padding: '1.25rem 0.875rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0',
              position: 'relative',
              cursor: selectionMode ? 'crosshair' : 'default',
              userSelect: selectionMode ? 'none' : 'auto',
            }}
          >
            {/* Selection rect — shown whenever coordinates exist, active or frozen */}
            {selStart && selEnd && (Math.abs(selEnd.x - selStart.x) > 8 || Math.abs(selEnd.y - selStart.y) > 8) && (
              <div style={{
                position: 'absolute',
                left: Math.min(selStart.x, selEnd.x),
                top: Math.min(selStart.y, selEnd.y),
                width: Math.abs(selEnd.x - selStart.x),
                height: Math.abs(selEnd.y - selStart.y),
                border: `2px dashed ${isDragging ? '#6366f1' : '#6366f1aa'}`,
                background: isDragging ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                borderRadius: '3px',
                pointerEvents: 'none',
                zIndex: 20,
                transition: 'opacity 0.2s',
              }} />
            )}
            {cuaderno.id === 'mc1' ? (() => {
              return (
                <div style={{
                  width: '100%', maxWidth: '480px',
                  background: '#ffffff',
                  borderRadius: '3px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.07)',
                  padding: '1.75rem 1.875rem 2rem',
                  pointerEvents: selectionMode ? 'none' : 'auto',
                }}>
                  <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${T.borderSoft}` }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, color: colors.color, letterSpacing: '0.08em', margin: '0 0 3px' }}>
                      {subject.name.toUpperCase()} · LECCIÓN {leccion.num}
                    </p>
                    <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.25rem', fontWeight: 500, color: T.black, letterSpacing: '-0.02em', margin: '0 0 3px' }}>
                      Fracciones y decimales
                    </h1>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.soft, margin: 0 }}>
                      Números reales y racionales · Prof. García
                    </p>
                  </div>
                  <div style={{ marginBottom: '0.875rem' }}>
                    <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.375rem' }}>¿Qué es una fracción?</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                      Una fracción expresa una parte de un todo. Se escribe con dos números separados por una <em>barra fraccionaria</em>: el de arriba se llama <strong>numerador</strong> y el de abajo <strong>denominador</strong>.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.75rem 1rem', background: T.bg, borderRadius: '8px', marginBottom: '0.875rem' }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.55rem', color: colors.color, fontWeight: 700, letterSpacing: '0.05em', margin: '0 0 1px' }}>NUMERADOR</p>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.6rem', fontWeight: 500, color: colors.color, margin: '0 0 1px', lineHeight: 1 }}>3</p>
                      <div style={{ height: '2px', background: T.black, borderRadius: '1px', margin: '2px 8px' }} />
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.6rem', fontWeight: 500, color: T.gray, margin: '1px 0', lineHeight: 1 }}>4</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.55rem', color: T.soft, fontWeight: 700, letterSpacing: '0.05em', margin: '1px 0 0' }}>DENOMINADOR</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.gray, margin: '0 0 4px', lineHeight: 1.5 }}><strong style={{ color: colors.color }}>Numerador:</strong> cuántas partes tienes</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: T.gray, margin: 0, lineHeight: 1.5 }}><strong>Denominador:</strong> en cuántas partes está dividido el todo</p>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.875rem' }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                      En la vida cotidiana usamos fracciones constantemente: <em>media</em> vuelta son ½, un <em>cuarto</em> de hora son 15 minutos, y tres <em>cuartos</em> de pizza es lo que queda tras comer un trozo de cuatro.
                    </p>
                  </div>
                  <div style={{ marginBottom: '0.875rem' }}>
                    <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.375rem' }}>Fracciones equivalentes</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                      Dos fracciones son <strong>equivalentes</strong> cuando representan la misma cantidad. Para obtenerlas, multiplicamos o dividimos numerador y denominador por el mismo número: <strong>2/4 = 1/2</strong>.
                    </p>
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.375rem' }}>De fracción a decimal</h2>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: '0 0 0.625rem' }}>
                      Divide numerador entre denominador:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                      {[['1/2','0,5'],['1/4','0,25'],['3/4','0,75'],['1/5','0,2']].map(([frac,dec]) => (
                        <div key={frac} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.625rem', background: T.bg, borderRadius: '7px' }}>
                          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.875rem', color: colors.color, fontWeight: 500, minWidth: '1.75rem' }}>{frac}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.soft }}>=</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: T.black, fontWeight: 500 }}>{dec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })() : cuaderno.id === 'hc1' ? (
              <div style={{ width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '3px', boxShadow: '0 2px 12px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.07)', padding: '1.75rem 1.875rem 2rem', pointerEvents: selectionMode ? 'none' : 'auto' }}>
                <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${T.borderSoft}` }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, color: colors.color, letterSpacing: '0.08em', margin: '0 0 3px' }}>HISTORIA · LECCIÓN 2</p>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.25rem', fontWeight: 500, color: T.black, letterSpacing: '-0.02em', margin: '0 0 3px' }}>Causas de la caída del Imperio Romano</h1>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.soft, margin: 0 }}>El mundo antiguo · Prof. Martínez</p>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.375rem' }}>El Imperio en el siglo V</h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                    En el año 476 d.C., Rómulo Augústulo, último emperador romano de Occidente, fue depuesto por el caudillo germano Odoacro. Pero la caída no fue repentina: fue el desenlace de un proceso de siglos.
                  </p>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.375rem' }}>Crisis interna</h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                    La corrupción administrativa, la devaluación de la moneda y el aumento de impuestos erosionaron la economía. El ejército, antes formado por ciudadanos romanos, dependía cada vez más de mercenarios germanos con lealtades divididas.
                  </p>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.375rem' }}>Presiones externas</h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                    Los pueblos bárbaros —visigodos, vándalos, hunos— presionaban las fronteras. El saqueo de Roma por los visigodos en 410 demostró que la ciudad ya no era inexpugnable. Las fronteras, demasiado extensas para defenderlas, iban cediendo.
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                  {[['410 d.C.','Saqueo de Roma (visigodos)'],['455 d.C.','Saqueo de Roma (vándalos)'],['476 d.C.','Caída oficial de Occidente'],['1453 d.C.','Caída del Imperio de Oriente']].map(([year, event]) => (
                    <div key={year} style={{ padding: '0.4rem 0.625rem', background: T.bg, borderRadius: '7px' }}>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.8rem', color: colors.color, fontWeight: 500, margin: '0 0 1px' }}>{year}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.67rem', color: T.gray, margin: 0, lineHeight: 1.4 }}>{event}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : cuaderno.id === 'bc1' ? (
              <div style={{ width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '3px', boxShadow: '0 2px 12px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.07)', padding: '1.75rem 1.875rem 2rem', pointerEvents: selectionMode ? 'none' : 'auto' }}>
                <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${T.borderSoft}` }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, color: colors.color, letterSpacing: '0.08em', margin: '0 0 3px' }}>BIOLOGÍA · LECCIÓN 1</p>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.25rem', fontWeight: 500, color: T.black, letterSpacing: '-0.02em', margin: '0 0 3px' }}>Procariota vs eucariota</h1>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.soft, margin: 0 }}>Estructura celular · Prof. Sánchez</p>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                    Toda la vida conocida está formada por células. Existen dos grandes tipos estructurales: las <strong>procariotas</strong> —más simples, sin núcleo definido— y las <strong>eucariotas</strong> —más complejas, con núcleo rodeado de membrana.
                  </p>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.5rem' }}>Diferencias clave</h2>
                  {[['Núcleo','Sin membrana nuclear','Con membrana nuclear'],['Tamaño','1–10 µm','10–100 µm'],['Organelas','No (salvo ribosomas)','Mitocondrias, RE, Golgi…'],['Ejemplos','Bacterias, arqueas','Animales, plantas, hongos']].map(([feat, pro, eu]) => (
                    <div key={feat} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '0.25rem', marginBottom: '0.25rem', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', fontWeight: 700, color: T.black }}>{feat}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.gray, padding: '0.2rem 0.4rem', background: T.bg, borderRadius: '4px' }}>{pro}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: colors.color, padding: '0.2rem 0.4rem', background: colors.pill, borderRadius: '4px' }}>{eu}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.375rem' }}>¿Cuál apareció primero?</h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                    Las procariotas surgieron hace ~3.800 millones de años. Las eucariotas aparecieron ~2.000 millones de años más tarde, probablemente por <em>endosimbiosis</em>: una procariota engulló a otra y esta se convirtió en mitocondria.
                  </p>
                </div>
              </div>
            ) : cuaderno.id === 'ec1' ? (
              <div style={{ width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '3px', boxShadow: '0 2px 12px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.07)', padding: '1.75rem 1.875rem 2rem', pointerEvents: selectionMode ? 'none' : 'auto' }}>
                <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${T.borderSoft}` }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, color: colors.color, letterSpacing: '0.08em', margin: '0 0 3px' }}>INGLÉS · LECCIÓN 2</p>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.25rem', fontWeight: 500, color: T.black, letterSpacing: '-0.02em', margin: '0 0 3px' }}>Since vs For</h1>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.soft, margin: 0 }}>Perfect tenses · Ms. Johnson</p>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                    Both <em>since</em> and <em>for</em> are used with the present perfect, but they express time differently. Confusing them is one of the most common mistakes.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  {[['FOR','duration','I\'ve studied for 2 hours','= a span of time'],['SINCE','starting point','I\'ve studied since 9 am','= a point in time']].map(([word, type, ex, desc]) => (
                    <div key={word} style={{ flex: 1, padding: '0.75rem', background: colors.pill, borderRadius: '8px' }}>
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1rem', color: colors.color, fontWeight: 500, margin: '0 0 2px' }}>{word}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', color: colors.color, fontWeight: 700, margin: '0 0 6px', letterSpacing: '0.04em' }}>{type.toUpperCase()}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: T.black, fontStyle: 'italic', margin: '0 0 3px' }}>&ldquo;{ex}&rdquo;</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.gray, margin: 0 }}>{desc}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.5rem' }}>Quick practice</h2>
                  {[['She has worked here ___ Monday.','since (point in time)'],['We have been waiting ___ 3 hours.','for (duration)'],['He hasn\'t slept ___ Tuesday.','since (point in time)'],['They\'ve known each other ___ years.','for (duration)']].map(([q, a]) => (
                    <div key={q} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.3rem 0.5rem', borderRadius: '6px', background: T.bg, marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: T.gray, fontStyle: 'italic' }}>{q}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: colors.color, fontWeight: 600, flexShrink: 0, marginLeft: '0.5rem' }}>→ {a}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : cuaderno.id === 'tc1' ? (
              <div style={{ width: '100%', maxWidth: '480px', background: '#fff', borderRadius: '3px', boxShadow: '0 2px 12px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.07)', padding: '1.75rem 1.875rem 2rem', pointerEvents: selectionMode ? 'none' : 'auto' }}>
                <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${T.borderSoft}` }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, color: colors.color, letterSpacing: '0.08em', margin: '0 0 3px' }}>TECNOLOGÍA · LECCIÓN 1</p>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontStyle: 'italic', fontVariationSettings: '"opsz" 72', fontSize: '1.25rem', fontWeight: 500, color: T.black, letterSpacing: '-0.02em', margin: '0 0 3px' }}>Ley de Ohm y resistencias</h1>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: T.soft, margin: 0 }}>Circuitos eléctricos · Prof. Ruiz</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: colors.pill, borderRadius: '10px', marginBottom: '1rem' }}>
                  <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: colors.color, margin: 0, letterSpacing: '-0.02em' }}>V = I × R</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
                    {[['V','Voltaje (V)'],['I','Intensidad (A)'],['R','Resistencia (Ω)']].map(([sym, name]) => (
                      <div key={sym} style={{ textAlign: 'center' }}>
                        <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1rem', color: colors.color, fontWeight: 500, margin: 0 }}>{sym}</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', color: T.gray, margin: 0 }}>{name}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.375rem' }}>¿Qué significa cada variable?</h2>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7875rem', color: T.gray, lineHeight: 1.65, margin: 0 }}>
                    El <strong>voltaje</strong> es la "presión" que empuja los electrones. La <strong>intensidad</strong> es cuántos electrones pasan por segundo. La <strong>resistencia</strong> es lo que dificulta ese paso, como una cañería estrecha.
                  </p>
                </div>
                <div>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: T.black, margin: '0 0 0.5rem' }}>Despejando la ecuación</h2>
                  {[['I = V / R','Corriente que circula'],['R = V / I','Resistencia necesaria'],['V = I × R','Voltaje resultante']].map(([eq, desc]) => (
                    <div key={eq} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.625rem', background: T.bg, borderRadius: '7px', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.9rem', color: colors.color, fontWeight: 500, minWidth: '5rem' }}>{eq}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.gray }}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#8a8a86', fontStyle: 'italic' }}>
                  Documento no disponible en demo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER: Chat ── */}
        <div style={{
          width: notesOpen ? '30%' : '38%', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${T.border}`,
          ...( CUADERNO_CHAT_STYLE[cuaderno.id] ?? { background: T.bg } ),
          transition: 'width 0.18s ease',
        }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12 }}
                  style={{ display: 'flex', justifyContent: m.role === 'student' ? 'flex-end' : 'flex-start', gap: '7px' }}
                >
                  {m.role === 'marco' && (
                    <div style={{ marginTop: 2 }}><MarcoAvatar size={26} /></div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: m.role === 'marco' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                    background: m.role === 'marco' ? T.white : colors.progress,
                    border: m.role === 'marco' ? `1.5px solid ${T.border}` : 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.8125rem',
                    color: m.role === 'marco' ? T.black : T.white,
                    lineHeight: 1.55,
                  }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                  <MarcoAvatar size={26} />
                  <div style={{ background: T.white, border: `1.5px solid ${T.border}`, borderRadius: '4px 14px 14px 14px', padding: '0.625rem 0.875rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <motion.div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: T.soft }}
                        animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18, ease: 'easeInOut' }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Hints */}
          {phase < 2 && (
            <div style={{ padding: '0.5rem 1rem', background: T.white, borderTop: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: T.soft, display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <Lightbulb size={11} /> Pistas:
                </span>
                {session.hints.map((h, i) => (
                  <button key={i} onClick={() => setHintLevel(i + 1)} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem',
                    background: hintLevel > i ? T.violet : T.note,
                    color: hintLevel > i ? T.deep : T.soft,
                    border: 'none', borderRadius: '9999px',
                    padding: '2px 7px', cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {hintLevel > i ? h : `Pista ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '0.625rem 1rem 0.75rem', background: T.white, borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Escribe tu respuesta..."
                style={{
                  flex: 1, padding: '0.5rem 0.75rem',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.8125rem',
                  color: T.black, background: T.bg,
                  border: `1.5px solid ${T.border}`, borderRadius: '9999px',
                  outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = T.accent)}
                onBlur={e => (e.target.style.borderColor = T.border)}
              />
              <button
                onClick={send}
                disabled={!input.trim() || typing}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: input.trim() && !typing ? T.deep : T.borderSoft,
                  border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s', flexShrink: 0,
                }}
              >
                <Send size={14} color={input.trim() && !typing ? '#fff' : T.soft} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {[
                { icon: Mic,       label: 'Audio'  },
                { icon: Image,     label: 'Foto'   },
                { icon: Paperclip, label: 'Archivo' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '3px',
                  padding: '2px 7px', borderRadius: '6px',
                  background: 'none', border: `1px solid ${T.borderSoft}`,
                  cursor: 'pointer', color: T.soft,
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem',
                  transition: 'border-color 0.12s, color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.gray; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderSoft; e.currentTarget.style.color = T.soft; }}
                >
                  <Icon size={11} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Tools panel ── */}
        <div style={{
          width: notesOpen ? '23%' : '0',
          flexShrink: 0,
          background: D.bg,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.18s ease',
        }}>
          <div style={{ padding: '0.875rem 1rem', borderBottom: `1px solid ${D.border}`, flexShrink: 0 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', fontWeight: 700, color: D.muted, letterSpacing: '0.08em', margin: 0 }}>
              BLOC DE NOTAS
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 1rem' }}>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Apunta aquí lo que quieras recordar..."
              style={{
                width: '100%', minHeight: '160px',
                background: D.surface, border: `1px solid ${D.border}`,
                borderRadius: '8px', padding: '0.75rem',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.75rem', color: D.text,
                lineHeight: 1.65, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = D.accent)}
              onBlur={e => (e.currentTarget.style.borderColor = D.border)}
            />

            <div style={{ marginTop: '0.875rem' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, color: D.muted, letterSpacing: '0.07em', margin: '0 0 0.5rem' }}>
                NOTAS RÁPIDAS
              </p>
              {[
                'numerador = partes tomadas',
                'denominador = total de partes',
                '2/4 = 1/2  (equivalentes)',
              ].map((note, i) => (
                <div key={i} style={{
                  padding: '0.375rem 0.625rem',
                  background: D.surface, border: `1px solid ${D.border}`,
                  borderRadius: '6px', marginBottom: '0.375rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.7rem', color: D.text, lineHeight: 1.4,
                }}>
                  {note}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${D.border}`, display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            {([
              { label: 'Duda', color: '#f59e0b' },
              { label: 'Clave', color: '#6366f1' },
              { label: 'Repaso', color: '#10b981' },
            ] as const).map(({ label, color }) => (
              <button key={label} style={{
                flex: 1, padding: '0.35rem 0',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem', fontWeight: 700, color,
                background: color + '18',
                border: `1px solid ${color}40`,
                borderRadius: '6px', cursor: 'pointer',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ══════════════ ROOT ══════════════ */
export default function StudentPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('loading');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [cuadernoCtx, setCuadernoCtx] = useState<{ cuaderno: Cuaderno; leccion: Leccion } | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScreen('home'), 1800);
    return () => clearTimeout(t);
  }, []);

  const logout = () => {
    setLeaving(true);
    setTimeout(() => {
      localStorage.removeItem('marco_role');
      router.push('/');
    }, 440);
  };

  const markDone = () => {
    if (!subject || !question) return;
    setSubjects(prev => prev.map(s =>
      s.id !== subject.id ? s : {
        ...s,
        completed: s.completed + (s.questions.find(q => q.id === question.id)?.done ? 0 : 1),
        questions: s.questions.map(q => q.id === question.id ? { ...q, done: true } : q),
      }
    ));
    setScreen('subject');
    setQuestion(null);
  };

  return (
    <BrowserChrome leaving={leaving}>
      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <motion.div key="loading" style={{ flex: 1, display: 'flex' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <LoadingScreen />
          </motion.div>
        )}
        {screen === 'home' && (
          <motion.div key="home" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <HomeScreen
              subjects={subjects}
              onSelect={s => { setSubject(subjects.find(x => x.id === s.id) ?? s); setScreen('subject'); }}
              logout={logout}
            />
          </motion.div>
        )}
        {screen === 'subject' && subject && (
          <motion.div key="subject" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}>
            <SubjectScreen
              subject={subjects.find(s => s.id === subject.id) ?? subject}
              onBack={() => setScreen('home')}
              onOpenCuaderno={(c, l) => { setCuadernoCtx({ cuaderno: c, leccion: l }); setScreen('cuaderno'); }}
            />
          </motion.div>
        )}
        {screen === 'cuaderno' && subject && cuadernoCtx && (
          <motion.div key="cuaderno" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}>
            <CuadernoScreen
              subject={subject}
              cuaderno={cuadernoCtx.cuaderno}
              leccion={cuadernoCtx.leccion}
              intentoNum={cuadernoCtx.cuaderno.intentos + 1}
              onBack={() => { setScreen('subject'); setCuadernoCtx(null); }}
            />
          </motion.div>
        )}
        {screen === 'chat' && subject && question && (
          <motion.div key="chat" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}>
            <ChatScreen
              subject={subject}
              question={question}
              onBack={() => { setScreen('subject'); setQuestion(null); }}
              onComplete={markDone}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserChrome>
  );
}
