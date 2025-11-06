import { useState, useEffect } from 'react';
import {
  SafeAreaView, Text, View, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { BenefitUsagePeriod, Company } from '@/src/types';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// --- API Calls ---
const fetchBenefitDetails = async (id: string) => {
  const { data } = await apiClient.get(`/api/benefits/${id}`);
  return data;
};
const updateBenefit = async ({ id, data }: { id: string, data: any }) => {
  const response = await apiClient.put(`/api/admin/benefits/${id}`, data);
  return response.data;
};
const fetchCompanies = async (): Promise<Company[]> => {
    const { data } = await apiClient.get('/api/admin/companies');
    return data;
  };

const periodOptions: { label: string; value: BenefitUsagePeriod }[] = [
    { label: 'Total', value: 'LIFETIME' },
    { label: 'Diario', value: 'DAILY' },
    { label: 'Semanal', value: 'WEEKLY' },
    { label: 'Mensual', value: 'MONTHLY' },
  ];

export default function EditBenefitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Estados del Formulario ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [usageLimit, setUsageLimit] = useState('1');
  const [pointCost, setPointCost] = useState('0');
  const [limitPeriod, setLimitPeriod] = useState<BenefitUsagePeriod>('LIFETIME');
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // --- Query para cargar los datos del beneficio ---
  const { data: benefitData, isLoading: isLoadingBenefit } = useQuery({
    queryKey: ['benefitDetails', id],
    queryFn: () => fetchBenefitDetails(id),
    enabled: !!id,
    onSuccess: (data) => {
      console.log(data)
      // Pre-rellenamos el formulario con los datos existentes
      setTitle(data.title);
      setDescription(data.description);
      setCompanyId(data.companyId);
      setUsageLimit(data.usageLimit.toString());
      setPointCost(data.pointCost.toString());
      setLimitPeriod(data.limitPeriod);
      if (data.expiresAt) setExpiresAt(new Date(data.expiresAt));
    },
  });

  console.log(benefitData)

  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
     queryKey: ['adminCompanies'],
     queryFn: fetchCompanies,
   });

  // --- Mutación para Guardar los Cambios ---
  const { mutate, isPending } = useMutation({
    mutationFn: updateBenefit,
    onSuccess: () => {
      Alert.alert('Éxito', 'El beneficio ha sido actualizado.');
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      queryClient.invalidateQueries({ queryKey: ['benefitDetails', id] });
      router.back();
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message),
  });

  const handleSave = () => {
    const data = {
      title,
      description,
      companyIdentifier: companyId,
      usageLimit: parseInt(usageLimit, 10),
      pointCost: parseInt(pointCost, 10),
      limitPeriod,
      expiresAt: expiresAt?.toISOString(),
    };
    mutate({ id, data });
  };

  if (isLoadingBenefit || isLoadingCompanies) {
    return <ActivityIndicator size="large" color={Colors.accent} className="flex-1" />;
  }

  const handleConfirmDate = (date: Date) => {
    setDatePickerVisibility(false);
    setExpiresAt(date);
  };

  return (
    <SafeAreaView className="flex-1 my-safe bg-background pt-6">
      <Stack.Screen options={{ title: "Editar Beneficio" }} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="p-6 space-y-4">
          <Text className="text-primary mb-4 text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>
                Editando: {benefitData?.title}
          </Text>
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
                          className={`py-3 px-4 rounded-lg mr-2  ${
                              companyId === company.id
                                  ? 'bg-accent'
                                  : 'bg-white/70 border border-1'
                          }`}
                        >
                          <Text className={`font-bold ${
                              companyId === company.id
                                  ? 'text-background'
                                  : 'text-secondary'
                          }`}>
                            {company.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                <TouchableOpacity onPress={() => router.push('/admin/create-company')} className="my-4 mr-4">
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
              
            </View>
          </ScrollView>
          <TouchableOpacity onPress={handleSave} disabled={isPending} className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40 mt-8">
            {isPending ? <ActivityIndicator /> : <Text>Guardar Cambios</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}