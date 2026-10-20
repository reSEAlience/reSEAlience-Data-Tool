import { Route, Routes } from "react-router";
import { useEffect } from "react";
import HomePage from './pages/homepage';
import MapPage from "./pages/mappage";
import MyIcon from './assets/Logo-w.png';

const App = () => {

    /*
    This useEffect hook is used to set the document title 
    and favicon when the component mounts. 
    It sets the title to "BakodDagat" 
    and creates link elements for different favicon sizes, 
    appending them to the document head. 
    This ensures that the favicon is displayed correctly 
    in the browser tab.
    */
    useEffect(() => {
        document.title = "BakodDagat";
        const sizes = [ 
          { size: "16x16", file: MyIcon },  
          { size: "32x32", file: MyIcon },
          { size: "192x192", file: MyIcon }
        ]; 

        sizes.forEach(({size, file}) => {
          const link = 
          document.querySelector("link[rel~='icon']") ||
          document.createElement("link");
          link.rel = "icon";
          link.href = MyIcon; 
          link.sizes = "192x192";
          document.head.appendChild(link);

        });
        }, []);

    
      /*
      The return statement of the App component defines the routing structure 
      of the application. It uses the Routes component to define a single route
      that maps the root path ("/") to the HomePage component. 
      This means that when users navigate to the root URL of the application, 
      the HomePage component will be rendered.

      Note: this will be updated to include the other pages based on the UI design
      */

    return (
        <Routes>
          {/* Homepage route */}
            <Route path="/" element={<HomePage />} />
            {/*General Mapping route  */}
            <Route path="/map" element={<MapPage />} />
        </Routes>
    );
};



export default App;
