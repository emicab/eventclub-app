// --- src/components/shared/BenefitCard.tsx (Rediseñado) ---
import { TouchableOpacity, View, Text, Image, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Benefit } from '@/src/types'; // Asegúrate de que tu tipo Benefit incluya los nuevos campos
import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type BenefitCardProps = {
  benefit: Benefit;
};

const DEFAULT_LOGO = 'https://placehold.co/50/1E1E1E/F0F6FC?text=Logo';

export default function BenefitCard({ benefit }: BenefitCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (benefit.isUsed) return;
    router.push(`/benefits/${benefit.id}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mirá este beneficio exclusivo de EventClub! "${benefit.title}" en ${benefit.company.name}. Descargá la app y unite al club.`,
        // url: 'https://eventclub.app' // URL de tu app
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      // disabled={benefit.isUsed}
      className={`flex-1 m-2 ${benefit.isUsed ? 'opacity-50' : ''}`}
    >
      <View className="relative w-full rounded-xl overflow-hidden">
        <BlurView
          intensity={80}
          tint="dark"
          style={{
            borderColor: Colors.glass.border,
            backgroundColor: Colors.glass.background,
            borderWidth: 1,
            height: 110,
            padding: 10,
            margin: 6,
            borderRadius: 10,
            position: 'relative'
          }}
          className="flex-1 p-3 justify-between relative"
        >
          {/* Cabecera con Logo, Nombre y Botón de Share */}
          <View className="flex-row justify-between items-start">
            <View className="flex-row items-start flex-1">
              <Image source={{ uri: benefit.company.logoUrl || DEFAULT_LOGO }} style={{ width: 50, height: 50 }} className="w-8 h-8 bg-white rounded-full p-2" />
              <View className='ml-4 justify-around'>
                <Text className="text-primary text-xl mb-4 " style={{ fontFamily: 'Inter_700Bold' }} numberOfLines={1}>
                  {benefit.company.name}
                </Text>
                <View>
                  <Text className="text-white text-xl" style={{ fontFamily: 'Inter_700Regular' }} numberOfLines={3}>
                    {benefit.title}
                  </Text>
                  <Text className="text-accent text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
                    {/* @ts-ignore */}
                    {benefit?.pointCost > 0 ? `Canjear por ${benefit.pointCost} puntos` : 'Gratis'}
                  </Text>
                </View>
              </View>
            </View>
            <View className='flex-row gap-4 items-center justify-center h-10'>
              {/* Pie con Etiquetas de Exclusividad */}
              
                {benefit.isNew && <Tag text="NUEVO" color="bg-newBenef" />}
                {benefit.isExclusive && <Tag text="EXCLUSIVO" color="bg-accent" />}
              
              <TouchableOpacity onPress={handleShare} className="">
                <Ionicons name="share-social-outline" size={20} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Overlay de "Agotado" si ya fue usado */}
          <ExhaustedOverlay visible={benefit.isUsed} />

        </BlurView>
      </View>
    </TouchableOpacity>
  );
}

// Componente auxiliar para las etiquetas
const Tag = ({ text, color }: { text: string; color: string }) => (
  <View className={`px-3 py-2 rounded-full ${color}`}>
    <Text className="text-white text-sm leading-6 font-bold">{text}</Text>
  </View>
);

const ExhaustedOverlay = ({ visible = false }: { visible: boolean }) => {
  return (
    <View
      className={`absolute inset-0 justify-center items-center rounded-2xl bg-black/20 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      pointerEvents={visible ? 'auto' : 'none'} // para que no bloquee clics si está invisible
    >
      <Text
        className="text-white text-xl font-bold px-4 py-2 rounded-xl bg-background backdrop-blur-sm rotate-12"
        style={{
          fontFamily: 'Inter_700Bold',
          transform: [{ rotate: '-20deg' }],
        }}
      >
        AGOTADO
      </Text>
    </View>
  );
};
