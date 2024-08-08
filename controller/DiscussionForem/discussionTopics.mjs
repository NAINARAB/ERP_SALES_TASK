import sql from 'mssql';
import { dataFound, noData, servError, invalidInput } from '../../res.mjs';

const TopicsController = () => {

    const getTopics = async (req, res) => {
        try {
            const query = `
                SELECT 
                    d.Id,
                    d.Topic,
                    d.Description,
                    d.CreatedAt,
                    d.Project_Id,
    
                    (SELECT COUNT(Id) AS UserCount FROM tbl_Discussion_Group_Members WHERE Topic_Id = d.Id) AS InvolvedUsersCount,
                    (SELECT COUNT(Id) AS MessageCount FROM tbl_Discussion_Messages WHERE Topic_Id = d.Id) AS TotalMessages,
                    (SELECT COUNT(Id) AS DocumentCount FROM tbl_Discussion_Files WHERE Topic_Id = d.Id) AS DocumentsShared,
    
                    ISNULL(
                        (
                        SELECT 
                            dgm.User_Id AS UserId,
                            u.Name AS Name
                        FROM 
                            tbl_Discussion_Group_Members AS dgm
                            LEFT JOIN 
                            tbl_Users AS u ON dgm.User_Id = u.UserId
                        WHERE 
                            dgm.Topic_Id = d.Id 
                            FOR JSON PATH
                       ), 
                        '[]'
                       ) AS InvolvedUsers
                                          
                FROM 
                    tbl_Discussion_Topics AS d
                WHERE 
                    d.IsActive = 1
                ORDER BY 
                    d.CreatedAt DESC`;
            const request = new sql.Request();
            const result = await request.query(query);

            if (result.recordset.length > 0) {
                const parseJson = [];
                for (let obj of result.recordset) {
                    obj.InvolvedUsers = JSON.parse(obj?.InvolvedUsers);
                    parseJson.push(obj);
                }
                return dataFound(res, parseJson);
            } else {
                return noData(res);
            }
        } catch (e) {
            servError(e, res);
        }
    };

    const createTopics = async (req, res) => {
        try {
            const { Topic, Description } = req.body;

            if (!Topic || !Description) {
                return res.status(400).json({ success: false, message: 'Topic and description are required' });
            }

            const insertQuery = `
                INSERT INTO tbl_Discussion_Topics (Topic, Description, CreatedAt)
                VALUES (@topic, @description, GETDATE());
            `;

            const request = new sql.Request();
            request.input('topic', Topic);
            request.input('description', Description);

            const result = await request.query(insertQuery);

            if (result.rowsAffected && result.rowsAffected[0] > 0) {
                return res.status(201).json({ success: true, message: 'New discussion topic added successfully' });
            } else {
                return res.status(500).json({ success: false, message: 'Failed to create discussion topic' });
            }
        } catch (error) {
            console.error('Error creating discussion topic:', error);
            return res.status(500).json({ success: false, message: 'An error occurred while creating the discussion topic' });
        }
    };

    const updateTopics = async (req, res) => {
        try {
            const { Id, Topic, Description } = req.body;

            if (!Id || !Topic || !Description) {
                return invalidInput(res, 'Topic and Description are required');
            }

            const updateQuery = `
                UPDATE tbl_Discussion_Topics 
                SET Topic = @topic, Description = @description
                WHERE Id = @Id;
            `;

            const request = new sql.Request();
            request.input('topic', Topic);
            request.input('description', Description);
            request.input('Id', Id);

            const result = await request.query(updateQuery);

            if (result.rowsAffected && result.rowsAffected[0] > 0) {
                return dataFound(res, [], 'Changes Saved');
            } else {
                return failed(res, 'Failed To Save');
            }
        } catch (e) {
            return servError(e, res);
        }
    };

    const deleteTopics = async (req, res) => {
        try {
            const { Id } = req.body;

            if (!Id) {
                return invalidInput(res, 'Id required');
            }

            const deleteQuery = `
                UPDATE tbl_Discussion_Topics 
                SET IsActive = 0
                WHERE Id = @Id;
            `;

            const request = new sql.Request();
            request.input('Id', Id);

            const result = await request.query(deleteQuery);

            if (result.rowsAffected && result.rowsAffected[0] > 0) {
                return dataFound(res, [], 'Topic Deleted');
            } else {
                return failed(res, 'Failed To Delete');
            }
        } catch (e) {
            return servError(e, res);
        }
    }
    

    return {
        getTopics,
        createTopics,
        updateTopics,
        deleteTopics
    }
}

export default TopicsController()