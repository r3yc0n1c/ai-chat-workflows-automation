import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo, RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IRoom, RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { sendDirectMessage } from './lib/Messages';

const WORKFLOW_RULE_ASSOCIATION: RocketChatAssociationRecord = new RocketChatAssociationRecord(
    RocketChatAssociationModel.MISC,
    'workflow-rule'
);
export class AiChatWorkflowsAutomationAppApp extends App implements IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.slashCommands.provideSlashCommand(new EnableWorkflowCommand());
    }

    public async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
        const ruleRecords = await read.getPersistenceReader().readByAssociation(WORKFLOW_RULE_ASSOCIATION);
        if (!ruleRecords || ruleRecords.length === 0) {
            return;
        }

        const sender = message.sender;
        const room = message.room;

        if (room.displayName !== 'test-chan') {
            return;
        }

        if (sender.username !== 'rey') {
            return;
        }

        if (!message.text || !message.text.toLowerCase().includes('welcome')) {
            return;
        }

        const appUser: IUser = await read.getUserReader().getAppUser() as IUser;
        
        const roomBuilder = modify.getCreator().startRoom()
            .setType(RoomType.DIRECT_MESSAGE)
            .setCreator(appUser)
            .setMembersToBeAddedByUsernames([sender.username]);
        const roomId = await modify.getCreator().finish(roomBuilder);
        const targetRoom = (await read.getRoomReader().getById(roomId)) as IRoom;

        const thankYouText = 'Hello habibi, thank you, wallah!';
        // const msgBuilder = modify.getCreator().startMessage()
        //     .setSender(appUser)
        //     .setRoom(targetRoom)
        //     .setText(thankYouText);
        // await modify.getCreator().finish(msgBuilder);
        await sendDirectMessage(read, modify, appUser, thankYouText, persistence);
    }
}

class EnableWorkflowCommand implements ISlashCommand {
    public command = 'autobot';
    public i18nDescription = 'Enable chat automation workflow';
    public i18nParamsExample = 'rule in plain english';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const args = context.getArguments();
        const ruleText = args.join(' ').trim();

        const expectedRule = 'whenever @rey posts any welcome messages in #test-chan, immediately DM him with a thank-you note';
        if (ruleText.toLowerCase() === expectedRule.toLowerCase()) {
            await persis.createWithAssociation({ rule: ruleText }, WORKFLOW_RULE_ASSOCIATION);
            const msg = modify.getCreator().startMessage()
                .setSender(context.getSender())
                .setRoom(context.getRoom())
                .setText('Automation rule enabled!');
            await modify.getCreator().finish(msg);
        } else {
            const msg = modify.getCreator().startMessage()
                .setSender(context.getSender())
                .setRoom(context.getRoom())
                .setText('Rule does not match the expected format. Please try again.');
            await modify.getCreator().finish(msg);
        }
    }
}
