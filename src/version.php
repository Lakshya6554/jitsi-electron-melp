<?php
    ini_set("display_errors", 0);
    ini_set("display_startup_errors", 0);
    error_reporting(E_ALL);
    $version = '140.0.0'; 

    $clientPreferredLang = isset($_COOKIE['clientPreferredLang']) ? $_COOKIE['clientPreferredLang'] : null;
    $languageInfo = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
    if( isset($languageInfo)){
        $languages = explode(',', $languageInfo); // Split the string into an array

        // Extract the language code from the first element
        $languageCode = substr($languages[0], 0, 2);
    }else{
        $languageCode = '';
    }
    $langName = ($clientPreferredLang !== null && $clientPreferredLang !== '') ? $clientPreferredLang : (($languageCode !== '') ? $languageCode : 'en');

    // Calculate the expiration time for the cookie (e.g., 10 years from now)
    $expiration = time() + (1 * 365 * 24 * 60 * 60);

    // Set the cookie with a far future expiration date
    setcookie("clientPreferredLang", $langName, $expiration, '/');

    /**
     * @Breif - If condition will be executed, when application trying to detect the new release and reload the application if new release detected.
     * and else condition will be executed to only get the version, and update the file like wise.
     */
    if(isset($_GET['getVersion'])){
        echo $version;
    }else{        
        return $version; 
    }
?>


