import Banner from '../components/Home/Banner';
import Features from '../components/Home/Features';
import TokensArea from '../components/Home/TokensArea';
import CryptocurrencyArea from '../components/Home/CryptocurrencyArea';
import OurFeature from '../components/Common/OurFeature';
import Portfolio from '../components/Common/Portfolio';
import BuySell from '../components/Common/BuySell';
import AppDownload from '../components/Common/AppDownload';
import AdvisorArea from '../components/Common/AdvisorArea';
import RegisterArea from '../components/Common/RegisterArea';
import Countdown from 'react-countdown';

const Index = () => {
  return (
    <>
      <Banner />
      <Features />
     
      <Countdown date={Date.now() + 80000000000} renderer={TokensArea} />
      <CryptocurrencyArea />
      <OurFeature />
      <Portfolio bgColor='bg-fff0ee' shape={true} />
      <BuySell />
      <AppDownload />
      <AdvisorArea />
      <RegisterArea
        bgGradient='bg-gradient-image'
        blackText='black-text'
        ctaImage='/images/man-with-ipad.png'
      />
    </>
  );
};

export default Index;
