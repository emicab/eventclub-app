import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

const GOOGLE_API_KEY = process.env.API_KEY;

export default function PlaceSearch({ onLocationSelected }: { onLocationSelected: (data: { name: string, lat: number, lng: number }) => void }) {
  console.log(process.env.API_KEY)
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
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_API_KEY}&language=es&components=country:ar`;
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
      console.log(location)
      onLocationSelected({ name, lat: location.lat, lng: location.lng });
      setSuggestions([]);
      setQuery(name);
    } catch (err) {
      console.error('Error al obtener detalles', err);
    } finally {
      setLoading(false);
    }
  };

  console.log(query)

  return (
    <View>
      <TextInput
        placeholder="Buscar lugar del evento"
        value={query}
        onChangeText={setQuery}
        style={{
          backgroundColor: '#f3f3f3',
          padding: 12,
          borderRadius: 10,
          marginBottom: 4,
        }}
      />

      {loading && <ActivityIndicator size="small" color="#666" className="mt-2" />}

      {suggestions.map((item, index) => (
        <TouchableOpacity 
            key={item.place_id || index} 
            onPress={() => fetchCoordinates(item.place_id, item.description)} 
        >
          <Text>{item.description}</Text>
        </TouchableOpacity>
      ))}


    </View>
  );
}
