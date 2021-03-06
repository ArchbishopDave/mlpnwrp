<?php
/**
* AUTO-GENERATED
* DO NOT EDIT
*/
class Model_Structure_ChatRoomTypeBase
{
    protected $m_chat_room_type_id;
    protected $m_name;
    protected $m_description;
    protected $m_chat_room_type_id_Orig;

    public function __construct($arrData = null)
    {
        if (isset($arrData)) {
            $this->loadFromArray($arrData);
        }
        else {
        }
        return;
    }
    public function ChatRoomTypeBase($arrData = null)
    {
        $this->__construct($arrData);
        return;
    }

    public function getChatRoomTypeId()
    {
        return $this->m_chat_room_type_id;
    }
    public function setChatRoomTypeId($value)
    {
        $this->m_chat_room_type_id = $value;
        $this->setOrigChatRoomTypeId($value);
        return;
    }

    public function getName()
    {
        return $this->m_name;
    }
    public function setName($value)
    {
        $this->m_name = $value;
        return;
    }

    public function getDescription()
    {
        return $this->m_description;
    }
    public function setDescription($value)
    {
        $this->m_description = $value;
        return;
    }

    public function getOrigChatRoomTypeId()
    {
        return $this->m_chat_room_type_id_Orig;
    }
    public function setOrigChatRoomTypeId($value)
    {
        if (isset($this->m_chat_room_type_id_Orig)) { return; }
        $this->m_chat_room_type_id_Orig = $value;
        return;
    }

    public function loadFromArray($arrValues)
    {
        $this->setChatRoomTypeId($arrValues['chat_room_type_id']);
        $this->setName($arrValues['name']);
        $this->setDescription($arrValues['description']);
        return;
    }

    public function updateFromArray($arrValues)
    {
        foreach ($arrValues as $key=>$val) {
            switch ($key) {
                case 'chat_room_type_id':
                    $this->setChatRoomTypeId($val);
                    break;
                case 'name':
                    $this->setName($val);
                    break;
                case 'description':
                    $this->setDescription($val);
                    break;
                default:
                    break;
            }
        }
        return;
    }

    public function getAsArray()
    {
        $arrValues = array();
        $arrValues['chat_room_type_id'] = $this->getChatRoomTypeId();
        $arrValues['name'] = $this->getName();
        $arrValues['description'] = $this->getDescription();
        return $arrValues;
    }

    public function validateInsert(&$arrErrors)
    {
        return true;
    }

    public function validateUpdate(&$arrErrors)
    {
        return true;
    }
}
