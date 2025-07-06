// Paleta optimizada para el estilo "Liquid Glass Night"
const Colors = {
  // Un fondo oscuro profundo, puede tener un gradiente sutil en la implementación final
  background: '#0D1117',

  // Colores para el texto con buena legibilidad sobre fondos oscuros y translúcidos
  text: {
    primary: '#F0F6FC',   // Blanco suave para títulos
    secondary: '#8B949E', // Gris claro para subtítulos y texto menos importante
    dark: '#222'
  },
  like: '#E74C3C',

  // Color de acento principal. Usaremos un magenta vibrante que resalta sobre el vidrio.
  accent: '#E040FB',

  // Colores para las superficies de "vidrio"
  glass: {
    // El color de fondo de nuestras tarjetas. Es un blanco con muy baja opacidad.
    background: 'rgba(255, 255, 255, 0.08)',
    // El color del borde, ligeramente más visible para definir la forma.
    border: 'rgba(255, 255, 255, 0.15)',
  },
  card: '#E1E1E1',
  newBenef: '#3B82F6',

  // Otros colores semánticos
  error: '#F87171',
  success: '#4ADE80',
};

export default Colors;
