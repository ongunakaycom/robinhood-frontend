import { AyaForUser} from './aya_brain';
import { getDatabase, ref, push} from 'firebase/database';


export const Communicator = (userId) => {

    const approach = async (args) => {
      const testmode = true;

        let requestedUserId = args.requestedUserId;
        if(testmode){
           requestedUserId = 'a1qpBPeKeQeOz8M20z49Gz3sXRQ2' ; 
          if (userId===requestedUserId) {
            requestedUserId='dbb4eEniVKX74rh0CEjGRgx2J4r1';
          }
        }

        console.log("requested user:", requestedUserId);
        const ayaOfOtherUser = await AyaForUser(requestedUserId);
        const prompt = "[[[incoming match approach]]] from userId: " + 
        userId +
        " ; reason for approach: " + args.reasonForCommunication +
        " ; message: " + args.message;
        console.log(prompt);   
        const aiResponse = await ayaOfOtherUser.getAIResponse(prompt);
        console.log(aiResponse);
        if (aiResponse) {
          await addMessageToRequestedUser('bot',aiResponse.text,requestedUserId,userId); 
        }
    };

    return {
        SendingUserId:userId,
        approach: approach
      };
}

const addMessageToRequestedUser = async (sender, text, requestedUserId, senderUserID) => {
    const db = getDatabase();
    const userMessagesRef = ref(db, `messages/${requestedUserId}`);
    const Message = {
      text: text,
      timestamp: Date.now(),
      sender: sender,
      author: senderUserID
    };
    await push(userMessagesRef, Message);
  };
