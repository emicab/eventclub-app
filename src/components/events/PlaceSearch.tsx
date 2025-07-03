import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function PlaceSearch({ onLocationSelected }: { onLocationSelected: (data: { name: string, lat: number, lng: number }) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
    
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchSuggestions = async (input: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}&language=es&types=establishment`;
      const res = await fetch(url);
      const json = await res.json();
      setSuggestions(json.predictions || []);
    } catch (err) {
      console.error('Error al buscar sugerencias', err);
    }
  };

  const fetchCoordinates = async (placeId: string, name: string) => {
    setLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const location = json.result.geometry.location;

      onLocationSelected({ name, lat: location.lat, lng: location.lng });
      setSuggestions([]);
       // Extraer el nombre sin la ciudad
      setQuery(name.split(',')[0]);

    } catch (err) {
      console.error('Error al obtener detalles', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View>
      <TextInput
      className='mb-2'
        placeholder="Buscar lugar del evento"
        value={query}
        onChangeText={setQuery}
        style={{
          backgroundColor: '#f3f3f3',
          padding: 12,
          borderRadius: 10,
        }}
      />

      {loading && <ActivityIndicator size="small" color="#666" className="mt-2" />}

      {suggestions.map((item, index) => (
        <TouchableOpacity 
            className='py-2 px-3 bg-primary rounded-md mb-2'
            key={item.place_id || index} 
            onPress={() => fetchCoordinates(item.place_id, item.description)} 
        >
          <Text className='text-dark'>{item.description}</Text>
        </TouchableOpacity>
      ))}


    </View>
  );
}
