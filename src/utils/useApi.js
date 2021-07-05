import { useState } from "react";

// apiFunction = the async function which provides an object output with "success", "reponse", and "message"
// getApiParams = a function which returns the most updated parameters to pass to the api
export default function useApi(apiFunction, getApiParams=()=>[], preCall, postCall, onSuccess, onFail) {
  const [apiResult, setApiResult] = useState(null);
  const [apiStatus, setApiStatus] = useState(0); // 0 = waiting, 1 = loading, 2 = success, 3 = error
  const [apiMessage, setApiMessage] = useState('');

  
  async function handleCallApi(preParams=[], postParams=[]) {
    setApiStatus(1);

    if(preCall) {
      await preCall(...preParams, ...postParams);
    }
    
    
    const result = await apiFunction(...preParams, ...getApiParams(), ...postParams);
    // console.log(result);

    if(postCall) {
      await postCall(...preParams, ...postParams);
    }

    if(result.success) {

      if(onSuccess) {
        await onSuccess(...preParams, ...postParams);
      }

      setApiResult(result.response);
      setApiMessage(result.message);
      setApiStatus(2);
    } else {

      if(onFail) {
        await onFail(...preParams, ...postParams);
      }

      setApiMessage(result.message);
      setApiStatus(3);
    }
  }

  return [handleCallApi, apiResult, apiStatus, apiMessage, [setApiResult, setApiStatus, setApiMessage]];
}