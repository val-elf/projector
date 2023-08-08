import { GenerateArtifacts } from './generate-artifacts';
import { GenerateCategories } from './generate-categories';
import { GenerateCharacters } from './generate-characters';
import { DatabaseGenerator } from './generate-database';
import { GenerateDocuments } from './generate-documents';
import { GenerateFiles } from './generate-files';
import { GenerateLocations } from './generate-locations';
import { GenerateProjects } from './generate-projects';
import { GenerateTags } from './generate-tags';
import { GenerateTimelines } from './generate-timelines';
import { GenerateTimespots } from './generate-timespots';
import { GenerateUsers, AuthenticateUser } from './generate-users';
import { GenerateVendors } from './generate-vendors';

export const generators = [
    DatabaseGenerator,
    GenerateVendors,
    GenerateUsers,
    AuthenticateUser,
    GenerateProjects,
    GenerateArtifacts,
    GenerateCharacters,
    GenerateLocations,
    GenerateTimelines,
    GenerateTimespots,
    GenerateTags,
    GenerateCategories,
    GenerateDocuments,
    GenerateFiles,
];