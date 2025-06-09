import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import SafeAreaView from '../components/SafeAreaView';
import { FONTS } from '../constants';

const dscvrColors = {
  electricMagenta: '#E500A4',
  vividBlue: '#375BDD',
  royalPurple: '#6D4DAD',
  seafoamTeal: '#66B8BC',
  midnightNavy: '#0D2D4F',
  pureWhite: '#FFFFFF',
};

const reportReasons = [
  { id: '1', label: 'Spam', icon: 'mail' },
  { id: '2', label: 'Harassment or Bullying', icon: 'warning' },
  { id: '3', label: 'Inappropriate Content', icon: 'alert-circle' },
  { id: '4', label: 'Fake Profile', icon: 'person-remove' },
  { id: '5', label: 'Violence or Dangerous Organizations', icon: 'shield' },
  { id: '6', label: 'Intellectual Property Violation', icon: 'document-text' },
  { id: '7', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function ReportUserScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userName } = route.params;

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) return;

    Alert.alert(
      'Report Submitted',
      'Thank you for helping keep our community safe. We will review this report and take appropriate action.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Messages'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={dscvrColors.midnightNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selectedReason}
          >
            <Text style={[
              styles.submitButton,
              !selectedReason && styles.submitButtonDisabled
            ]}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Why are you reporting {userName}?</Text>
            <Text style={styles.infoText}>
              Your report is anonymous. We'll review it and take action if it violates our Community Guidelines.
            </Text>
          </View>

          {/* Reason Selection */}
          <View style={styles.reasonsSection}>
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonItem,
                  selectedReason === reason.id && styles.reasonItemSelected
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <View style={styles.reasonLeft}>
                  <Ionicons 
                    name={reason.icon as any} 
                    size={24} 
                    color={selectedReason === reason.id ? dscvrColors.electricMagenta : dscvrColors.midnightNavy} 
                  />
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason.id && styles.reasonTextSelected
                  ]}>
                    {reason.label}
                  </Text>
                </View>
                {selectedReason === reason.id && (
                  <Ionicons name="checkmark-circle" size={24} color={dscvrColors.electricMagenta} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Information */}
          {selectedReason && (
            <View style={styles.additionalSection}>
              <Text style={styles.additionalTitle}>Additional Information (Optional)</Text>
              <TextInput
                style={styles.additionalInput}
                placeholder="Provide more details about this report..."
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Guidelines Link */}
          <TouchableOpacity style={styles.guidelinesLink}>
            <Ionicons name="information-circle-outline" size={20} color={dscvrColors.vividBlue} />
            <Text style={styles.guidelinesText}>Learn more about our Community Guidelines</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: dscvrColors.pureWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
  },
  submitButton: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
  submitButtonDisabled: {
    color: '#999',
  },
  infoSection: {
    backgroundColor: dscvrColors.pureWhite,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: dscvrColors.midnightNavy,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: '#666',
    lineHeight: 20,
  },
  reasonsSection: {
    backgroundColor: dscvrColors.pureWhite,
    marginTop: 8,
    paddingVertical: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reasonItemSelected: {
    backgroundColor: '#FFF0FA',
  },
  reasonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reasonText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    marginLeft: 16,
  },
  reasonTextSelected: {
    fontFamily: FONTS.medium,
    color: dscvrColors.electricMagenta,
  },
  additionalSection: {
    backgroundColor: dscvrColors.pureWhite,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  additionalTitle: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: dscvrColors.midnightNavy,
    marginBottom: 12,
  },
  additionalInput: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: dscvrColors.midnightNavy,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  guidelinesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  guidelinesText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: dscvrColors.vividBlue,
    marginLeft: 8,
  },
});
