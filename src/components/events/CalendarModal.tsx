import { Modal, View, TouchableOpacity, SafeAreaView, Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';

LocaleConfig.locales['es'] = LocaleConfig.locales['es'] = {
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    today: "Hoy"
  };
LocaleConfig.defaultLocale = 'es';

type CalendarModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date?: string) => void;
  selectedDate?: string;
};

export default function CalendarModal({ visible, onClose, onSelectDate, selectedDate }: CalendarModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-background pt-12">
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
          {selectedDate && (
            <TouchableOpacity
              onPress={() => {
                onSelectDate(undefined);
                onClose();
              }}
              className="mr-2"
            >
              <Text className="text-accent" style={{ fontFamily: 'Inter_700Bold' }}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>
        <Calendar
          onDayPress={(day) => {
            onSelectDate(day.dateString);
            onClose();
          }}
          markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: Colors.accent } } : {}}
          theme={{
            backgroundColor: Colors.background,
            calendarBackground: Colors.background,
            textSectionTitleColor: Colors.text.secondary,
            selectedDayBackgroundColor: Colors.accent,
            selectedDayTextColor: '#ffffff',
            todayTextColor: Colors.accent,
            dayTextColor: Colors.text.primary,
            textDisabledColor: '#333',
            arrowColor: Colors.accent,
            monthTextColor: Colors.text.primary,
            indicatorColor: 'blue',
            textDayFontFamily: 'Inter_400Regular',
            textMonthFontFamily: 'Inter_700Bold',
            textDayHeaderFontFamily: 'Inter_700Bold',
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}