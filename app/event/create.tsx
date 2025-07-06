import {
  SafeAreaView, Text, View, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Image
} from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import PlaceSearch from '@/src/components/events/PlaceSearch';
import { countryToCurrency } from '@/utils/countryToCurrency';
import { Ionicons } from '@expo/vector-icons';

const createEvent = async (formData: FormData) => {
  const { data } = await apiClient.post('/api/admin/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const fetchCompanies = async () => {
  const { data } = await apiClient.get('/api/admin/companies');
  return data;
};

type TicketForm = {
  name: string;
  price: string; // Usamos string para el input
  quantity: string;
};


export default function CreateEventScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [place, setPlace] = useState('');
  const [city, setCity] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [images, setImage] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [companyId, setCompanyId] = useState<string>('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [tickets, setTickets] = useState<TicketForm[]>([
    { name: '', price: '', quantity: '' }
  ]);


  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      Alert.alert('Éxito', 'El evento ha sido creado.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.back();
    },
    onError: (error: any) =>
      Alert.alert('Error', error.response?.data?.message || 'No se pudo crear el evento.'),
  });

  const handleCreate = () => {
    if (!title || !date || !companyId || !latitude || !longitude) {
      return Alert.alert('Error', 'Por favor, completa el título, fecha, compañía y ubicación.');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', date.toISOString());
    formData.append('companyId', companyId);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('address', address);
    formData.append('place', place);
    formData.append('city', city);
    // formData.append('country', country);
    // formData.append('currency', currency);

    images.forEach((image) => {
      // @ts-ignore
      formData.append('images', {
        uri: image.uri, name: image.fileName || 'event.jpg', type: image.mimeType || 'image/jpeg'
      });
    });

    // Convertimos los tickets a números y los añadimos al FormData
    const formattedTickets = tickets
      .filter(t => t.name && t.price && t.quantity)
      .map(t => ({
        name: t.name,
        priceInCents: Math.round(parseFloat(t.price) * 100),
        quantity: parseInt(t.quantity, 10),
      }));

    formData.append('tickets', JSON.stringify(formattedTickets));

    mutate(formData);
  };

  const handleTicketChange = (index: number, field: keyof TicketForm, value: string) => {
    const newTickets = [...tickets];
    newTickets[index][field] = value;
    setTickets(newTickets);
  };

  const addTicketField = () => {
    setTickets([...tickets, { name: '', price: '', quantity: '' }]);
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Necesitas dar permiso para acceder a tus fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets);
    }
  };

  const handleConfirmDate = (selectedDate: Date) => {
    setDatePickerVisibility(false);
    setDate(selectedDate);
  };

  return (
    <SafeAreaView className="flex-1 bg-background pt-10 my-safe">
      <Stack.Screen options={{ title: "Crear Nuevo Evento", headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
      {/* CORRECCIÓN: Se añade keyboardShouldPersistTaps='handled' a la ScrollView */}
      <ScrollView keyboardShouldPersistTaps='handled'>
        <View className="p-6 gap-4">
          <Text className="text-primary text-xl font-bold">Información del Evento</Text>
          <TouchableOpacity onPress={handlePickImage} className="bg-card h-48 rounded-lg justify-center items-center">
            {images.length > 0
              ? <Image source={{ uri: images[0].uri }} className="w-full h-full rounded-lg" />
              : <Text className="text-secondary">Toca para subir imágenes</Text>}
          </TouchableOpacity>

          <TextInput className="bg-card text-dark p-4 rounded-lg" placeholder="Título del Evento" value={title} onChangeText={setTitle} />
          <TextInput className="bg-card text-dark p-4 h-24 rounded-lg" multiline placeholder="Descripción del evento" value={description} onChangeText={setDescription} />
          <TouchableOpacity onPress={() => setDatePickerVisibility(true)} className="bg-card p-4 rounded-lg">
            <Text className={date ? 'text-dark' : 'text-secondary'}>
              {date ? date.toLocaleString('es-ES') : 'Seleccionar Fecha y Hora'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal isVisible={isDatePickerVisible} mode="datetime" onConfirm={handleConfirmDate} onCancel={() => setDatePickerVisibility(false)} />

          <PlaceSearch
            onLocationSelected={({ name, lat, lng }) => {
              const parts = name.split(',');
              const place = parts[0]?.trim();
              const address = parts[1]?.trim();
              const city = parts[2]?.trim();
              const countryName = parts[parts.length - 1]?.trim();


              console.log(countryName)

              setLatitude(lat);
              setLongitude(lng);
              setPlace(place);
              setAddress(address);
              setCity(city);
              setCountry(countryName);

              // Mapear país → moneda
              const mappedCurrency = countryToCurrency[countryName] || 'USD';
              setCurrency(mappedCurrency);
            }}
          />
          {currency && (
            <View className="bg-glass rounded-lg p-4 mt-2">
              <Text className="text-dark font-semibold">Moneda detectada:</Text>
              <Text className="text-primary text-lg">{currency}</Text>
            </View>
          )}

          {/* --- SECCIÓN DE ENTRADAS --- */}
          <Text className="text-primary text-xl font-bold mt-4 mb-2">Tipos de Entrada</Text>
          {tickets.map((ticket, index) => (
            <View key={index} className="bg-slate-600 p-2 rounded-lg gap-4">
              <TextInput className="bg-card text-dark p-4 rounded-md" placeholder="Nombre (ej: General)" value={ticket.name} onChangeText={(val) => handleTicketChange(index, 'name', val)} />
              <TextInput className="bg-card text-dark p-4 rounded-md" keyboardType="numeric" placeholder="Precio (ej: 25.50)" value={ticket.price} onChangeText={(val) => handleTicketChange(index, 'price', val)} />
              <TextInput className="bg-card text-dark p-4 rounded-md" keyboardType="numeric" placeholder="Cantidad disponible" value={ticket.quantity} onChangeText={(val) => handleTicketChange(index, 'quantity', val)} />
            </View>
          ))}
          <TouchableOpacity onPress={addTicketField} className="flex-row items-center justify-center p-3 bg-card rounded-lg">
            <Ionicons name="add-circle-outline" size={24} color={Colors.accent} />
            <Text className="text-accent ml-2 font-bold">Añadir otro tipo de entrada</Text>
          </TouchableOpacity>

          {/* Selector de Compañía */}
          <View className="mt-12">
            <Text className="text-primary text-xl font-bold mb-2">Compañía Organizadora</Text>
            {loadingCompanies ? <ActivityIndicator color={Colors.accent} /> : (
              companies.map((company: any) => (
                <TouchableOpacity
                  key={company.id}
                  onPress={() => setCompanyId(company.id)}
                  className={`p-3 rounded-md mb-2 ${companyId === company.id ? 'bg-accent' : 'bg-card'}`}
                >
                  <Text className={companyId === company.id ? 'text-background font-bold' : 'text-dark'}>
                    {company.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <TouchableOpacity onPress={handleCreate} disabled={isPending} className="bg-accent p-4 rounded-lg items-center mt-4">
            {isPending ? <ActivityIndicator color={Colors.background} /> : <Text className="text-background font-bold">Crear Evento</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
