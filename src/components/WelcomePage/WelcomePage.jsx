import "./WelcomePage.css";
import { Container, Row, Col, Button} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import CookieDisclaimer from "./CookieDisclaimer/CookieDisclaimer.jsx";
import WelcomePageHeader from "./WelcomePageHeader/WelcomePageHeader.jsx";
import { useTranslation } from 'react-i18next';

function WelcomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();


  const handleLearnMore = () => {
    navigate("/about"); 
  };


  return (
    <div className="WelcomePage">
      <WelcomePageHeader />
      <main className="welcome-container">
        <Container>
          <Row>
            <Col md={6} className="w-100">
              <h1 className={`mb-4 mt-5 pt-3`} >
                {t('heading')}
              </h1>
              <p>
                Aya is your Dr. Love and modern Matchmaker
              </p>
            </Col>
          </Row>
          <Row>
            <p><img src="/img/aya-avatar.jpg" alt="Avatar" className="ayaphoto" /></p>
            <p>
           <Button onClick={handleLearnMore}>Learn more</Button>
            </p>            
          </Row>
          <Row>
            <span className="small text-white mb-2">
              <b>No</b> wait time - <b>No</b> cost<br /><b>No</b> strings attached - <b>No</b> login required
            </span>
            </Row>
        </Container>
      </main>
      <Footer /> 
      <CookieDisclaimer />
    </div>
  );
}
export default WelcomePage;
