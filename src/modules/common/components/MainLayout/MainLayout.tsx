import React, { FC } from 'react';
import styles from './styles.module.scss';
import { Header } from '../Header/Header';
import { Aside } from '../Aside/Aside';

export const MainLayout: FC = ({ children }) => {
    return (
        <div className={styles.mainLayout}>
            <Header />
            <Aside />
            <div className={styles.content}>{children}</div>
            {/*<Footer />*/}
            {/*<TransponderCheck />*/}
        </div>
    );
};
