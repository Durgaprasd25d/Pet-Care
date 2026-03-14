import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';

// Extra Main Screens
import { NotificationsScreen } from '../screens/Main/NotificationsScreen';
import { EditProfileScreen } from '../screens/Main/EditProfileScreen';
import { SettingsScreen } from '../screens/Main/SettingsScreen';
import { UserProfileScreen } from '../screens/Main/UserProfileScreen';

// Pet Screens

// Vet Screens
import { VetListScreen } from '../screens/Veterinary/VetListScreen';
import { VetProfileScreen } from '../screens/Veterinary/VetProfileScreen';
import { BookAppointmentScreen } from '../screens/Veterinary/BookAppointmentScreen';
import { SelectAppointmentTimeScreen } from '../screens/Veterinary/SelectAppointmentTimeScreen';
import { AppointmentConfirmationScreen } from '../screens/Veterinary/AppointmentConfirmationScreen';
import { AppointmentDetailsScreen } from '../screens/Veterinary/AppointmentDetailsScreen';

// Adoption Screens
import { AdoptionHomeScreen } from '../screens/Adoption/AdoptionHomeScreen';
import { AdoptionListScreen } from '../screens/Adoption/AdoptionListScreen';
import { AdoptionDetailsScreen } from '../screens/Adoption/AdoptionDetailsScreen';
import { AdoptionApplicationScreen } from '../screens/Adoption/AdoptionApplicationScreen';
import { ApplicationSuccessScreen } from '../screens/Adoption/ApplicationSuccessScreen';
import { AdoptionStatusScreen } from '../screens/Adoption/AdoptionStatusScreen';

// Lost & Found Screens
import { LostFoundHomeScreen } from '../screens/LostFound/LostFoundHomeScreen';
import { ReportLostPetScreen } from '../screens/LostFound/ReportLostPetScreen';
import { ReportFoundPetScreen } from '../screens/LostFound/ReportFoundPetScreen';
import { LostPetDetailsScreen } from '../screens/LostFound/LostPetDetailsScreen';
import { FoundPetDetailsScreen } from '../screens/LostFound/FoundPetDetailsScreen';

// Community Screens
import { CreatePostScreen } from '../screens/Community/CreatePostScreen';
import { PostDetailsScreen } from '../screens/Community/PostDetailsScreen';
import { UserCommunityProfileScreen } from '../screens/Community/UserCommunityProfileScreen';
import { CommentsScreen } from '../screens/Community/CommentsScreen';
import { AskQuestionScreen } from '../screens/Community/AskQuestionScreen';

// Emergency Screens
import { EmergencySOSScreen } from '../screens/Emergency/EmergencySOSScreen';
import { NearbyVetClinicsScreen } from '../screens/Emergency/NearbyVetClinicsScreen';
import { EmergencyContactScreen } from '../screens/Emergency/EmergencyContactScreen';
import { EmergencyDetailsScreen } from '../screens/Emergency/EmergencyDetailsScreen';

// Utility Screens
import { SearchScreen } from '../screens/Utility/SearchScreen';
import { FilterResultsScreen } from '../screens/Utility/FilterResultsScreen';
import { ReminderCenterScreen } from '../screens/Utility/ReminderCenterScreen';
import { VaccinationReminderScreen } from '../screens/Utility/VaccinationReminderScreen';
import { HelpSupportScreen } from '../screens/Utility/HelpSupportScreen';
import { AboutAppScreen } from '../screens/Utility/AboutAppScreen';
import { PrivacySecurityScreen } from '../screens/Utility/PrivacySecurityScreen';
import { TermsOfServiceScreen } from '../screens/Utility/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '../screens/Utility/PrivacyPolicyScreen';
import { OpenSourceLibrariesScreen } from '../screens/Utility/OpenSourceLibrariesScreen';
import { PetAIChatScreen } from '../screens/Utility/PetAIChatScreen';

// Store Screens

export type AppStackParamList = {
  MainTabs: undefined;
  Notifications: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Profile: undefined;
  VetList: undefined;
  VetProfile: { vetId: string };
  BookAppointment: { vetId?: string };
  SelectAppointmentTime: { petId: string, vetId: string, reason: string };
  AppointmentConfirmation: { petId: string, vetId: string, date: string, time: string, reason: string };
  AppointmentDetails: { appointmentId: string };
  AdoptionHome: undefined;
  AdoptionList: { filter?: string };
  AdoptionDetails: { adoptionId: string };
  AdoptionApplication: { petId: string, petName: string };
  ApplicationSuccess: { petName: string };
  AdoptionStatus: undefined;
  LostFoundHome: undefined;
  ReportLostPet: undefined;
  ReportFoundPet: undefined;
  LostPetDetails: { itemId: string };
  FoundPetDetails: { itemId: string };
  CreatePost: undefined;
  PostDetails: { postId: string };
  UserCommunityProfile: { userId: string };
  Comments: { postId: string };
  AskQuestion: undefined;
  EmergencySOS: undefined;
  NearbyVetClinics: undefined;
  EmergencyContact: undefined;
  EmergencyDetails: { emergencyId: string };
  Search: undefined;
  FilterResults: undefined;
  ReminderCenter: undefined;
  VaccinationReminder: undefined;
  HelpSupport: undefined;
  AboutApp: undefined;
  PrivacySecurity: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  OpenSourceLibraries: undefined;
  PetAIChat: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={UserProfileScreen} />
      
      <Stack.Screen name="VetList" component={VetListScreen} />
      <Stack.Screen name="VetProfile" component={VetProfileScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="SelectAppointmentTime" component={SelectAppointmentTimeScreen} />
      <Stack.Screen name="AppointmentConfirmation" component={AppointmentConfirmationScreen} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
      
      <Stack.Screen name="AdoptionHome" component={AdoptionHomeScreen} />
      <Stack.Screen name="AdoptionList" component={AdoptionListScreen} />
      <Stack.Screen name="AdoptionDetails" component={AdoptionDetailsScreen} />
      <Stack.Screen name="AdoptionApplication" component={AdoptionApplicationScreen} />
      <Stack.Screen name="ApplicationSuccess" component={ApplicationSuccessScreen} />
      <Stack.Screen name="AdoptionStatus" component={AdoptionStatusScreen} />
      
      <Stack.Screen name="LostFoundHome" component={LostFoundHomeScreen} />
      <Stack.Screen name="ReportLostPet" component={ReportLostPetScreen} />
      <Stack.Screen name="ReportFoundPet" component={ReportFoundPetScreen} />
      <Stack.Screen name="LostPetDetails" component={LostPetDetailsScreen} />
      <Stack.Screen name="FoundPetDetails" component={FoundPetDetailsScreen} />
      
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
      <Stack.Screen name="UserCommunityProfile" component={UserCommunityProfileScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
      <Stack.Screen name="AskQuestion" component={AskQuestionScreen} />
      
      <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
      <Stack.Screen name="NearbyVetClinics" component={NearbyVetClinicsScreen} />
      <Stack.Screen name="EmergencyContact" component={EmergencyContactScreen} />
      <Stack.Screen name="EmergencyDetails" component={EmergencyDetailsScreen} />
      
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="FilterResults" component={FilterResultsScreen} />
      <Stack.Screen name="ReminderCenter" component={ReminderCenterScreen} />
      <Stack.Screen name="VaccinationReminder" component={VaccinationReminderScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="AboutApp" component={AboutAppScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="OpenSourceLibraries" component={OpenSourceLibrariesScreen} />
      <Stack.Screen name="PetAIChat" component={PetAIChatScreen} />
    </Stack.Navigator>
  );
};
