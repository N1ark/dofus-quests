import dataRaw from './data.json';

export type Data = {
	nodes: {
		id: string;
		name: string;
		type: 'quest' | 'achievement';
		description: string;
		requirements: string[];
	}[];
	edges: {
		to: string;
		from: string;
		type: 'FINISHED' | 'NOT_FINISHED' | 'IN_PROGRESS' | 'FINISHED_N_TIMES' | 'AVAILABLE';
	}[];
	categories: {
		id: number;
		name: string;
	}[];
};

export const data = dataRaw as Data;
