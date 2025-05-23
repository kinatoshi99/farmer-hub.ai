import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient'; // Corrected path
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [location, setLocation] = useState('');
  const [soilTypes, setSoilTypes] = useState('');
  const [landArea, setLandArea] = useState('');
  // Add state for other profile fields from `profiles` and `farms` tables as needed

  const [dbError, setDbError] = useState(null);
  const [dbMessage, setDbMessage] = useState('');


  useEffect(() => {
    if (!supabase) {
        setLoading(false);
        // router.push('/auth'); // Should not happen if supabaseClient.js handles its init failure
        return;
    }

    const fetchUserProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setLoading(false);
        router.push('/auth');
        return;
      }
      
      if (!session) {
        router.push('/auth');
        return;
      }
      
      setUser(session.user);

      // Fetch additional profile data from 'profiles' and 'farms' tables
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username, website, avatar_url') // Add other fields as needed
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: row not found, can be normal if profile not filled yet
        console.error('Error fetching profile data:', profileError);
        setDbError('Could not fetch profile data.');
      } else if (profileData) {
        setFullName(profileData.full_name || '');
        // set other fields from profileData
      }

      // Fetch farm data (assuming one farm per user for now, or you'd list them)
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .select('farm_name, location, soil_types, land_area_hectares') // Add other fields
        .eq('user_id', session.user.id)
        .maybeSingle(); // Use maybeSingle if a user might not have a farm entry yet

       if (farmError && farmError.code !== 'PGRST116') {
        console.error('Error fetching farm data:', farmError);
        setDbError((prev) => (prev ? prev + ' And could not fetch farm data.' : 'Could not fetch farm data.'));
      } else if (farmData) {
        setFarmName(farmData.farm_name || '');
        setLocation(farmData.location || '');
        setSoilTypes(farmData.soil_types || '');
        setLandArea(farmData.land_area_hectares || '');
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setDbError(null);
    setDbMessage('');
    if (!user || !supabase) return;

    // 1. Update 'profiles' table
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        // username: newUsername, // username usually not updated here or handled carefully due to uniqueness
        updated_at: new Date().toISOString(), 
      })
      .eq('id', user.id);

    if (profileUpdateError) {
      console.error('Error updating profile:', profileUpdateError);
      setDbError('Failed to update profile: ' + profileUpdateError.message);
      return;
    }

    // 2. Update or Insert 'farms' table data
    // Check if a farm record exists to decide between update or insert
    const { data: existingFarm, error: fetchFarmError } = await supabase
      .from('farms')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchFarmError && fetchFarmError.code !== 'PGRST116') {
        console.error('Error checking existing farm:', fetchFarmError);
        setDbError('Failed to check farm data: ' + fetchFarmError.message);
        return;
    }

    let farmUpsertError;
    if (existingFarm) {
        // Update existing farm
        const { error } = await supabase
            .from('farms')
            .update({
                farm_name: farmName,
                location: location,
                soil_types: soilTypes,
                land_area_hectares: landArea,
            })
            .eq('user_id', user.id);
        farmUpsertError = error;
    } else {
        // Insert new farm
        const { error } = await supabase
            .from('farms')
            .insert({
                user_id: user.id,
                farm_name: farmName,
                location: location,
                soil_types: soilTypes,
                land_area_hectares: landArea,
            });
        farmUpsertError = error;
    }

    if (farmUpsertError) {
      console.error('Error upserting farm data:', farmUpsertError);
      setDbError('Failed to save farm data: ' + farmUpsertError.message);
      return;
    }

    setDbMessage('Profile and farm information updated successfully!');
  };


  // --- Styles (copied for consistency) ---
  const formGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const buttonStyle = { padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const errorStyle = { color: 'red', marginBottom: '10px' };
  const messageStyle = { color: 'green', marginBottom: '10px' };


  if (loading) {
    return <Layout><p>Loading profile...</p></Layout>;
  }
  if (!user) {
    // This should ideally not be reached if useEffect redirects correctly,
    // but serves as a fallback or if redirection is slower.
    return <Layout><p>Redirecting to login...</p></Layout>;
  }

  return (
    <Layout>
      <h1>Your Farm Profile</h1>
      {dbError && <p style={errorStyle}>{dbError}</p>}
      {dbMessage && <p style={messageStyle}>{dbMessage}</p>}

      <form onSubmit={handleProfileUpdate} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={formGroupStyle}>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input type="email" id="email" name="email" style={inputStyle} value={user.email} disabled />
          <small> (Email cannot be changed here)</small>
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="fullName" style={labelStyle}>Full Name</label>
          <input type="text" id="fullName" name="fullName" style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <hr style={{margin: "20px 0"}}/>
        <h2>Farm Details</h2>

        <div style={formGroupStyle}>
          <label htmlFor="farmName" style={labelStyle}>Farm Name</label>
          <input type="text" id="farmName" name="farmName" style={inputStyle} value={farmName} onChange={(e) => setFarmName(e.target.value)} />
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="location" style={labelStyle}>Location (e.g., City, Region)</label>
          <input type="text" id="location" name="location" style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="soilTypes" style={labelStyle}>Soil Types (e.g., Loamy, Sandy Clay)</label>
          <input type="text" id="soilTypes" name="soilTypes" style={inputStyle} value={soilTypes} onChange={(e) => setSoilTypes(e.target.value)} />
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="landArea" style={labelStyle}>Land Area (Hectares)</label>
          <input type="number" id="landArea" name="landArea" style={inputStyle} value={landArea} onChange={(e) => setLandArea(e.target.value)} step="0.1" />
        </div>

        <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile & Farm Details'}
        </button>
      </form>
    </Layout>
  );
}
