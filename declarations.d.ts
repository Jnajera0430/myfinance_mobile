declare module 'react-native-qrcode-decoder';
declare module 'victory-native' {
  import * as React from 'react';
    export const VictoryPie: React.FC<any>;
    export const VictoryLegend: React.FC<any>;
    export const VictoryTooltip: React.FC<any>;
    export const VictoryContainer: React.FC<any>;
}

declare module 'react-native-svg' {
  import * as React from 'react';
    export const Svg: React.FC<any>;
    export const Path: React.FC<any>;
    export const G: React.FC<any>;
    export const Defs: React.FC<any>;
    export const LinearGradient: React.FC<any>;
    export const Stop: React.FC<any>;
}

declare module 'expo-linear-gradient' {
  import * as React from 'react';
    export const LinearGradient: React.FC<any>;
}

declare module '@react-native-clipboard/clipboard' {
  export const setString: (text: string) => void;
}