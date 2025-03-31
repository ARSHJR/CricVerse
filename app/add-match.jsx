import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { initializeTeamPlayers, DEFAULT_TEAMS } from '../services/teamService';

// Get team names from DEFAULT_TEAMS
const teams = Object.values(DEFAULT_TEAMS).map(team => team.name);

const AddMatch = () => {
  const router = useRouter();
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const getTeamId = (teamName) => {
    const team = Object.values(DEFAULT_TEAMS).find(t => t.name === teamName);
    return team ? team.id : teamName.replace(/\s+/g, '-').toLowerCase();
  };

  const handleAddMatch = async () => {
    if (!team1 || !team2) {
      Alert.alert('Error', 'Please select both teams');
      return;
    }

    if (team1 === team2) {
      Alert.alert('Error', 'Please select different teams');
      return;
    }

    try {
      // Initialize team players if not already initialized
      const team1Id = getTeamId(team1);
      const team2Id = getTeamId(team2);

      await Promise.all([
        initializeTeamPlayers(team1Id),
        initializeTeamPlayers(team2Id),
      ]);

      // Format date and time
      const formattedDate = date.toISOString().split('T')[0];
      const formattedTime = time.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      // Calculate match timestamp
      const matchTimestamp = new Date(date);
      matchTimestamp.setHours(time.getHours());
      matchTimestamp.setMinutes(time.getMinutes());
      const timestamp = matchTimestamp.getTime();

      console.log('Creating match with data:', {
        team1,
        team2,
        date: formattedDate,
        time: formattedTime,
        team1Id,
        team2Id,
        timestamp
      });

      // Add match to Firestore
      const matchRef = await addDoc(collection(db, 'matches'), {
        team1,
        team2,
        date: formattedDate,
        time: formattedTime,
        status: 'upcoming',
        team1Id,
        team2Id,
        createdAt: new Date().toISOString(),
        timestamp
      });

      console.log('Match created successfully with ID:', matchRef.id);

      Alert.alert(
        'Success',
        'Match added successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/',
              params: { refresh: 'true' }
            }),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding match:', error);
      Alert.alert('Error', 'Failed to add match. Please try again.');
    }
  };

  const DatePickerModal = () => {
    const [tempDate, setTempDate] = useState(date);
    
    const addDays = (days) => {
      const newDate = new Date(tempDate);
      newDate.setDate(newDate.getDate() + days);
      setTempDate(newDate);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDateModal}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <Text style={styles.selectedDate}>{tempDate.toLocaleDateString()}</Text>
            <View style={styles.dateControls}>
              <TouchableOpacity style={styles.dateButton} onPress={() => addDays(-1)}>
                <Text>Previous Day</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateButton} onPress={() => addDays(1)}>
                <Text>Next Day</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setDate(tempDate);
                  setShowDateModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const TimePickerModal = () => {
    const [tempTime, setTempTime] = useState(time);
    
    const addHours = (hours) => {
      const newTime = new Date(tempTime);
      newTime.setHours(newTime.getHours() + hours);
      setTempTime(newTime);
    };

    const addMinutes = (minutes) => {
      const newTime = new Date(tempTime);
      newTime.setMinutes(newTime.getMinutes() + minutes);
      setTempTime(newTime);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimeModal}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <Text style={styles.selectedTime}>
              {tempTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={styles.timeControls}>
              <View style={styles.timeButtonGroup}>
                <TouchableOpacity style={styles.timeButton} onPress={() => addHours(-1)}>
                  <Text>-1h</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.timeButton} onPress={() => addHours(1)}>
                  <Text>+1h</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeButtonGroup}>
                <TouchableOpacity style={styles.timeButton} onPress={() => addMinutes(-30)}>
                  <Text>-30m</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.timeButton} onPress={() => addMinutes(30)}>
                  <Text>+30m</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setTime(tempTime);
                  setShowTimeModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Team 1</Text>
        <View style={styles.teamButtonsContainer}>
          {teams.map((teamName) => (
            <TouchableOpacity
              key={teamName}
              style={[
                styles.teamButton,
                team1 === teamName && styles.selectedTeam,
              ]}
              onPress={() => setTeam1(teamName)}
            >
              <Text style={[
                styles.teamButtonText,
                team1 === teamName && styles.selectedTeamText,
              ]}>{teamName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Team 2</Text>
        <View style={styles.teamButtonsContainer}>
          {teams.map((teamName) => (
            <TouchableOpacity
              key={teamName}
              style={[
                styles.teamButton,
                team2 === teamName && styles.selectedTeam,
              ]}
              onPress={() => setTeam2(teamName)}
            >
              <Text style={[
                styles.teamButtonText,
                team2 === teamName && styles.selectedTeamText,
              ]}>{teamName}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDateModal(true)}
        >
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowTimeModal(true)}
        >
          <Text>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMatch}
        >
          <Text style={styles.addButtonText}>Add Match</Text>
        </TouchableOpacity>
      </View>

      <DatePickerModal />
      <TimePickerModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  teamButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  teamButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  selectedTeam: {
    backgroundColor: '#1e90ff',
  },
  teamButtonText: {
    color: '#333',
  },
  selectedTeamText: {
    color: '#fff',
  },
  pickerButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#1e90ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectedDate: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  selectedTime: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  timeControls: {
    width: '100%',
    marginBottom: 20,
  },
  timeButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  confirmButton: {
    backgroundColor: '#1e90ff',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AddMatch; 