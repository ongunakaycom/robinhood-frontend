import React, { useState, useEffect } from 'react'; 
import { Button, Card } from "react-bootstrap";
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Footer from '../../Footer/Footer';
import Alert from '../../Alert/Alert'; 
import './MyDates.css';

const MyDates = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dates, setDates] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch dates or other data directly here, e.g., from Firebase
        fetchData(user.uid);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const fetchData = async (uid) => {
    try {
      // Replace this with the actual fetching logic
      const fetchedDates = await getDatesFromFirebase(uid); // Example of how you might fetch data from Firebase.
      setDates(fetchedDates);
    } catch (err) {
      setError('Failed to load dates');
    }
  };

  const handleConfirm = async (dateId) => {
    try {
      // Your logic for confirming a date
      await confirmDate(dateId);
      setSuccess('Date confirmed successfully');
    } catch (err) {
      setError('Failed to confirm date');
    }
  };

  return (
    <div className='AyaFormPage'>
      <DashboardHeader />

      <main className='form-page-content'>
        <div className='form-page-container'>
          <h2>Your Dates</h2>
          <div className="dates">
            {dates.map((date) => (
              <Card key={date.id} className="dates-card">
                <Card.Body>
                  <Card.Title className="date-header">
                    <div className="avatar-container">
                      <img src={date.photo} alt="User Avatar" className="avatar" />
                      {date.name} - {date.time}
                    </div>
                  </Card.Title>                    
                  {/* Confirmation status for the other user */}
                  <div
                    className={`confirmation-status ${
                      date.confirmed?.other ? "confirmed" : "not-confirmed"
                    }`}
                  >
                    {date.confirmed?.other
                      ? `${date.name} has confirmed`
                      : `${date.name} has not yet confirmed`}
                  </div>

                  {/* Your confirmation status */}
                  {date.confirmed?.me ? (
                    <p className="confirmation-status confirmed">
                      You have confirmed this date.
                    </p>
                  ) : (
                    <p className="confirmation-status not-confirmed">
                      You have not yet confirmed this date.
                    </p>
                  )}

                  {/* Button logic */}
                  {!date.confirmed?.me ? (
                    <Button onClick={() => handleConfirm(date.id)}>
                      Confirm now
                    </Button>
                  ) : date.confirmed?.me && date.confirmed?.other ? (
                    <p className="message-text text-success">
                      Both you and {date.name} have confirmed this date!
                    </p>
                  ) : (
                    <p className="message-text text-warning">
                      Waiting for {date.name} to confirm the date.
                    </p>
                  )}

                </Card.Body>
              </Card>              
            ))}
          </div>
          
          {/* Show alerts */}
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />
          
          <Link to="/dashboard" className='back-to-home'>
            ← Back to Dashboard
          </Link>
        </div>
      </main>

      <Footer/>
    </div>
  );
};

export default MyDates;
