import { useContext } from 'react';
import { BotContext } from '../../store/Bot';
import BotGIF from './Woman';

const Frame = () => {
  const { state } = useContext(BotContext);

  return (
    <div className="h-full py-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">It's me, Pekanu! </h1>
      <div className="relative">
        <BotGIF state={state}  />
      </div>
    </div>
  );
};

export default Frame;
