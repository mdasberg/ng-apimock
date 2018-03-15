interface Configuration {
    // requests base url
    baseUrl: string;
    // the directory containing the mocks
    src: string;
    // callback function
    done: Function;
    // the output directory
    outputDir: string;
}

export default Configuration;
