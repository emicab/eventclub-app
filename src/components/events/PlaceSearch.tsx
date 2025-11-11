import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

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
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&accept-language=es`;
      const res = await fetch(url);
      const json = await res.json();
      setSuggestions(json || []);
    } catch (err) {
      console.error('Error al buscar sugerencias', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const name = item.display_name;
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    onLocationSelected({ name, lat, lng });
    setSuggestions([]);
    setQuery(name.split(',')[0]);
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
            onPress={() => handleSelectSuggestion(item)} 
        >
          <Text className='text-dark'>{item.display_name}</Text>
        </TouchableOpacity>
      ))}


    </View>
  );
}
