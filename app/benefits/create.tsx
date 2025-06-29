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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { BenefitUsagePeriod } from '@/src/types';

// La función que llama a la API ahora incluye el nuevo campo `usageLimit`
const createBenefit = async (data: { 
    title: string; 
    description: string; 
    companyIdentifier: string;
    usageLimit: number;
}) => {
  const response = await apiClient.post('/api/admin/benefits', data);
  return response.data;
};

const periodOptions: { label: string; value: BenefitUsagePeriod }[] = [
  { label: 'Limitado', value: 'LIFETIME' },
  { label: 'Diario', value: 'DAILY' },
  { label: 'Semanal', value: 'WEEKLY' },
  { label: 'Mensual', value: 'MONTHLY' },
];

export default function CreateBenefitScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyIdentifier, setCompanyIdentifier] = useState('');
  const [usageLimit, setUsageLimit] = useState('1'); // <-- NUEVO ESTADO, por defecto 1 uso
  const [limitPeriod, setLimitPeriod] = useState<BenefitUsagePeriod>('LIFETIME');

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
    if (!title || !description || !companyIdentifier || !usageLimit) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    const limit = parseInt(usageLimit, 10);
    if (isNaN(limit) || limit < 1) {
        Alert.alert('Error', 'El límite de usos debe ser un número válido mayor a 0.');
        return;
    }

    // Pasamos el nuevo límite a la mutación
    mutate({ title, description, companyIdentifier, usageLimit: limit });
  };

  return (
    <SafeAreaView className="flex-1 my-safe bg-background pt-6">
      <Stack.Screen options={{ title: "Crear Nuevo Beneficio", headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
      <ScrollView>
        <View className="p-6  space-y-4">
          <Text className="text-primary mb-4 text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>
            Crear un nuevo beneficio
          </Text>
          <Text className="text-primary mb-4 text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
            Detalles
          </Text>

          <TextInput
            className="bg-card my-1 text-dark font-bold text-lg rounded-lg p-4 w-full border border-glass-border focus:border-accent"
            placeholder="Título del Beneficio (ej: 15% de descuento)"
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
           <TextInput
            className="bg-card my-1 text-dark text-lg rounded-lg p-4 w-full border border-glass-border focus:border-accent"
            placeholder="ID o Nombre de la Empresa Asociada"
            placeholderTextColor={Colors.text.secondary}
            value={companyIdentifier}
            onChangeText={setCompanyIdentifier}
          />
          
           <TextInput
            className="bg-card my-1 text-dark text-lg rounded-lg p-4 w-full border border-glass-border focus:border-accent"
            placeholder="Límite de Usos (ej: 1)"
            placeholderTextColor={Colors.text.secondary}
            value={usageLimit}
            onChangeText={setUsageLimit}
            keyboardType="numeric"
          />
          
          <View>
            <Text className="text-primary text-xl mt-4 mb-2" style={{ fontFamily: 'Inter_400Regular' }}>Período del Límite</Text>
            <View className="flex-row gap-4">
                {periodOptions.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => setLimitPeriod(option.value)}
                        // Cambia el estilo si el botón está seleccionado
                        className={`py-2 px-3 rounded-lg border ${
                            limitPeriod === option.value
                                ? 'bg-accent border-accent'
                                : 'border-glass-border'
                        }`}
                    >
                        <Text className={`font-bold ${
                            limitPeriod === option.value
                                ? 'text-background'
                                : 'text-primary'
                        }`}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>
          
          <TouchableOpacity
            className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40 mt-4"
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
