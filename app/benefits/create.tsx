import { useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Importa useQuery
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { BenefitUsagePeriod, Company } from '@/src/types'; // Asume que tienes un tipo 'Company'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

// API call para crear el beneficio
const createBenefit = async (data: { 
    title: string; 
    description: string; 
    companyIdentifier: string; // El backend acepta ID o Nombre
    usageLimit: number;
    pointCost: number;
    limitPeriod: BenefitUsagePeriod;
    expiresAt?: string;
}) => {
  const response = await apiClient.post('/api/admin/benefits', data);
  return response.data;
};

// --- NUEVA FUNCIÓN PARA OBTENER EMPRESAS ---
const fetchCompanies = async (): Promise<Company[]> => {
  const { data } = await apiClient.get('/api/admin/companies');
  return data;
};
// --- FIN NUEVA FUNCIÓN ---

const periodOptions: { label: string; value: BenefitUsagePeriod }[] = [
  { label: 'Total', value: 'LIFETIME' },
  { label: 'Diario', value: 'DAILY' },
  { label: 'Semanal', value: 'WEEKLY' },
  { label: 'Mensual', value: 'MONTHLY' },
];

export default function CreateBenefitScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState(''); // <-- Ahora guardamos el ID
  const [usageLimit, setUsageLimit] = useState('1');
  const [pointCost, setPointCost] = useState('0');
  const [limitPeriod, setLimitPeriod] = useState<BenefitUsagePeriod>('LIFETIME');
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // --- NUEVA QUERY PARA OBTENER EMPRESAS ---
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['adminCompanies'],
    queryFn: fetchCompanies,
  });
  // --- FIN NUEVA QUERY ---

  const { mutate, isPending } = useMutation({
    mutationFn: createBenefit,
    onSuccess: () => {
      Alert.alert('Éxito', 'El beneficio ha sido creado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo crear el beneficio.');
    }
  });

  const handleCreate = () => {
    if (!title || !description || !companyId || !usageLimit || !pointCost) { // <-- Verificamos companyId
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    const limit = parseInt(usageLimit, 10);
    const points = parseInt(pointCost, 10);
    if (isNaN(limit) || limit < 1 || isNaN(points) || points < 0) {
        Alert.alert('Error', 'El límite de usos y los puntos deben ser números válidos.');
        return;
    }

    mutate({ 
      title, 
      description, 
      companyIdentifier: companyId, // <-- Pasamos el ID como identificador
      usageLimit: limit,
      pointCost: points,
      limitPeriod,
      expiresAt: expiresAt?.toISOString(),
    });
  };

  const handleConfirmDate = (date: Date) => {
    setDatePickerVisibility(false);
    setExpiresAt(date);
  };

  return (
    <SafeAreaView className="flex-1 my-safe bg-background pt-6">
      <Stack.Screen options={{ title: "Crear Nuevo Beneficio", headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="p-6 space-y-4">
          <Text className="text-primary mb-4 text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>
            Detalles del Beneficio
          </Text>

          {/* --- REEMPLAZO DEL TEXTINPUT POR UN SELECTOR --- */}
          <View>
            <Text className="text-primary text-base mt-2 mb-2" style={{ fontFamily: 'Inter_400Regular' }}>Empresa Asociada</Text>
            {isLoadingCompanies ? (
              <ActivityIndicator color={Colors.accent} />
            ) : (
              <View className="bg-card rounded-lg border border-glass-border p-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {companies?.map((company) => (
                    <TouchableOpacity
                      key={company.id}
                      onPress={() => setCompanyId(company.id)}
                      className={`py-3 px-4 rounded-lg mr-2 ${
                          companyId === company.id
                              ? 'bg-accent'
                              : 'bg-white/10'
                      }`}
                    >
                      <Text className={`font-bold ${
                          companyId === company.id
                              ? 'text-background'
                              : 'text-primary'
                      }`}>
                        {company.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <TouchableOpacity onPress={() => router.push('/admin/create-company')} className="mt-2">
              <Text className="text-accent text-sm text-right">+ Crear nueva empresa</Text>
            </TouchableOpacity>
          </View>
          {/* --- FIN DEL REEMPLAZO --- */}


          <TextInput
            className="bg-card my-1 text-dark font-bold text-lg rounded-lg p-4 w-full border border-glass-border focus:border-accent"
            placeholder="Título (ej: 15% de descuento)"
            placeholderTextColor={Colors.text.secondary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="bg-card my-1 text-dark text-lg rounded-lg p-4 w-full h-24 border border-glass-border focus:border-accent"
            placeholder="Descripción y condiciones"
            placeholderTextColor={Colors.text.secondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          
          <Text className="text-primary text-xl mt-4 mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Reglas de Uso</Text>
          
           <TextInput
            className="bg-card my-1 text-dark text-lg rounded-lg p-4 w-full border border-glass-border focus:border-accent"
            placeholder="Límite de Usos por persona (ej: 1)"
            placeholderTextColor={Colors.text.secondary}
            value={usageLimit}
            onChangeText={setUsageLimit}
            keyboardType="numeric"
          />
          
          <View>
            <Text className="text-primary text-base mt-2 mb-2" style={{ fontFamily: 'Inter_400Regular' }}>Frecuencia del Límite</Text>
            <View className="flex-row flex-wrap gap-2">
                {periodOptions.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => setLimitPeriod(option.value)}
                        className={`py-2 px-3 rounded-lg border ${
                            limitPeriod === option.value
                                ? 'bg-accent border-accent'
                                : 'bg-card border-glass-border'
                        }`}
                    >
                        <Text className={`font-bold ${
                            limitPeriod === option.value
                                ? 'text-background'
                                : 'text-dark'
                        }`}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>

          <Text className="text-primary text-xl mt-4 mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Costo y Vigencia</Text>
          
          <TextInput
            className="bg-card my-1 text-dark text-lg rounded-lg p-4 w-full border border-glass-border focus:border-accent"
            placeholder="Costo en Puntos (0 para gratis)"
            placeholderTextColor={Colors.text.secondary}
            value={pointCost}
            onChangeText={setPointCost}
            keyboardType="numeric"
          />

          <TouchableOpacity onPress={() => setDatePickerVisibility(true)} className="bg-card p-4 rounded-lg mt-2">
            <Text className={expiresAt ? 'text-dark' : 'text-secondary'}>
              {expiresAt ? `Expira el: ${expiresAt.toLocaleDateString('es-ES')}` : 'Seleccionar Fecha de Caducidad (Opcional)'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisibility(false)}
            confirmTextIOS="Confirmar"
            cancelTextIOS="Cancelar"
          />
          
          <TouchableOpacity
            className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40 mt-8"
            onPress={handleCreate}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text className="text-background text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                Crear Beneficio
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}