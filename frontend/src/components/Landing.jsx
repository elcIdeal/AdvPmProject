import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import * as THREE from 'three';
import HALO from 'vanta/dist/vanta.halo.min';

const useVantaEffect = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        HALO({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: true,
          minHeight: 200.00,
          minWidth: 200.00,
          backgroundColor: 0x1a2b4b,
          amplitudeFactor: 2.00,
          size: 1.50
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return vantaRef;
};

// Styled Components
const LandingContainer = styled.div`
  overflow-x: hidden;
  background: #1a1233;
  color: #ffffff;
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
`;

const Section = styled.section`
  min-height: 100vh;
  padding: 4rem 2rem;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  scroll-snap-align: start;
  scroll-snap-stop: always;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const HeroSection = styled(Section)`
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(26, 43, 75, 0.3);
    z-index: 1;
    width: 100vw;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
`;

const Title = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffac33 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Montserrat', sans-serif;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  max-width: 600px;
  line-height: 1.6;
  color: #a3b1cc;
`;

const CTAButton = styled(motion.button)`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: linear-gradient(135deg, #ffd700 0%, #ffac33 100%);
  color: #1a2b4b;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StepsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const StepCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Footer = styled.footer`
  background: rgba(0, 0, 0, 0.3);
  padding: 2rem;
  text-align: center;
  scroll-snap-align: start;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;

  a {
    color: #a3b1cc;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #ffd700;
    }
  }
`;

const Landing = () => {
  const containerRef = useRef(null);
  const vantaRef = useVantaEffect();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  
  const { scrollYProgress } = useScroll({
    container: containerRef
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
    
    // Redirect to dashboard if user is authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      title: 'AI-Powered Expense Tracking',
      description: 'Track and categorize your spending with ease.',
      icon: '📊'
    },
    {
      title: 'Personalized Credit Card Recommendations',
      description: 'Get the best credit card offers based on your habits.',
      icon: '💳'
    },
    {
      title: 'Intelligent Financial Insights',
      description: 'Understand your financial trends instantly.',
      icon: '📈'
    },
    {
      title: 'Smart Alerts & Notifications',
      description: 'Receive actionable alerts on your spending and saving.',
      icon: '🔔'
    }
  ];

  const steps = [
    {
      title: 'Upload Your Bank Statements',
      description: 'Link your bank or credit card accounts statements` securely.',
      icon: '🏦'
    },
    {
      title: 'Track Your Spending',
      description: 'Our AI categorizes your spending for you.',
      icon: '📱'
    },
    {
      title: 'Get Personalized Insights',
      description: 'Receive smart suggestions and tailored credit card recommendations.',
      icon: '💡'
    },
    {
      title: 'Take Action and Save',
      description: 'Implement suggestions and start saving today.',
      icon: '💰'
    }
  ];

  return (
    <LandingContainer ref={containerRef}>
      <HeroSection ref={vantaRef}>
        <Content>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{fontSize: "8rem"}}>Expin</div><br/>
            Transform Your Finances
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >

            Track spending, save money, and make smarter financial decisions—effortlessly.
          </Subtitle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/login">
              <CTAButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Get Started for Free
              </CTAButton>
            </Link>
          </motion.div>
        </Content>
      </HeroSection>

      <Section>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8 text-center"
        >
          What Expin Can Do for You
        </motion.h2>
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </Section>

      <Section>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8 text-center"
        >
          How It Works
        </motion.h2>
        <StepsContainer>
          {steps.map((step, index) => (
            <StepCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </StepCard>
          ))}
        </StepsContainer>
      </Section>

      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Start saving today. Get personalized financial insights in minutes.
          </h2>
          <Link to="/login">
            <CTAButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Sign Up for Free
            </CTAButton>
          </Link>
        </motion.div>
      </Section>

      <Footer>
        <FooterLinks>
          <Link to="/about">About Us</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/contact">Contact Us</Link>
        </FooterLinks>
        <p className="text-gray-400">© 2025 Expin. All rights reserved.</p>
      </Footer>
    </LandingContainer>
  );
};

export default Landing;