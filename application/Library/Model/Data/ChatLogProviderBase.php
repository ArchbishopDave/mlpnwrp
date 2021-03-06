<?php
/**
* AUTO-GENERATED
* DO NOT EDIT
*/
require_once CORE_ROOT . 'DAO.php';
class Model_Data_ChatLogProviderBase
{
    protected function getOneFromQuery($strSql, $params)
    {
        $arrResults = array();
        $arrErrors = array();
        if (DAO::getAssoc($strSql, $params, $arrResults, $arrErrors)) {
            if (count($arrResults) > 0) {
                return new Model_Structure_ChatLog($arrResults[0]);
            }
        }
        return null;
    }

    protected function getArrayFromQuery($strSql, $params)
    {
        $arrResults = array();
        $arrErrors = array();
        if (DAO::getAssoc($strSql, $params, $arrResults, $arrErrors)) {
            $arrRecordList = array();
            foreach ($arrResults as $arrRecord) {
                $arrRecordList[] = new Model_Structure_ChatLog($arrRecord);
            }
            return $arrRecordList;
        }
        return null;
    }

    public function getOneByPk($chat_log_id)
    {
        $strSql = 'SELECT * FROM `chat_log` WHERE chat_log_id=?';
        $params = array($chat_log_id);
        return Model_Data_ChatLogProvider::getOneFromQuery($strSql, $params);
    }

    public function insertOne(&$objRecord, &$arrErrors)
    {
        $strSql = ' INSERT INTO `chat_log` (
            chat_log_id,
            chat_room_id,
            user_id,
            handle,
            character_id,
            recipient_user_id,
            recipient_username,
            text,
            timestamp,
            color,
            chat_rand
        ) VALUES  (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $params = array(
            0,
            $objRecord->getChatRoomId(),
            $objRecord->getUserId(),
            $objRecord->getHandle(),
            $objRecord->getCharacterId(),
            $objRecord->getRecipientUserId(),
            $objRecord->getRecipientUsername(),
            $objRecord->getText(),
            $objRecord->getTimestamp(),
            $objRecord->getColor(),
            $objRecord->getChatRand()
        );
        $arrErrors = array();
        $blnResult = DAO::execute($strSql, $params, $arrErrors);
        if ($blnResult) {
            $objRecord->setChatLogId(DAO::getInsertId());
        }
        return $blnResult;
    }

    public function updateOne($objRecord, &$arrErrors)
    {
        $strSql = 'UPDATE `chat_log` SET 
            chat_log_id=?,
            chat_room_id=?,
            user_id=?,
            handle=?,
            character_id=?,
            recipient_user_id=?,
            recipient_username=?,
            text=?,
            timestamp=?,
            color=?,
            chat_rand=?
        WHERE chat_log_id=?';
        $arrSetParams = array(
            $objRecord->getChatLogId(),
            $objRecord->getChatRoomId(),
            $objRecord->getUserId(),
            $objRecord->getHandle(),
            $objRecord->getCharacterId(),
            $objRecord->getRecipientUserId(),
            $objRecord->getRecipientUsername(),
            $objRecord->getText(),
            $objRecord->getTimestamp(),
            $objRecord->getColor(),
            $objRecord->getChatRand()
        );
        $arrKeyParams = array($objRecord->getOrigChatLogId());
        $params = array_merge($arrSetParams, $arrKeyParams);
        $arrErrors = array();
        $blnResult = DAO::execute($strSql, $params, $arrErrors);
        return $blnResult;
    }

    public function deleteOne($objRecord, &$arrErrors)
    {
        $strSql = 'DELETE FROM `chat_log` WHERE chat_log_id=?';
        $params = array($objRecord->getChatLogId());
        $arrErrors = array();
        $blnResult = DAO::execute($strSql, $params, $arrErrors);
        return $blnResult;
    }
}
