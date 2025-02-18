<?php

namespace HiEvents\DomainObjects\Generated;

/**
 * THIS FILE IS AUTOGENERATED - DO NOT EDIT IT DIRECTLY.
 * @package HiEvents\DomainObjects\Generated
 */
abstract class TicketTaxAndFeesDomainObjectAbstract extends \HiEvents\DomainObjects\AbstractDomainObject
{
    final public const SINGULAR_NAME = 'ticket_tax_and_fees';
    final public const PLURAL_NAME = 'ticket_tax_and_fees';
    final public const ID = 'id';
    final public const TICKET_ID = 'ticket_id';
    final public const TAX_AND_FEE_ID = 'tax_and_fee_id';

    protected int $id;
    protected int $ticket_id;
    protected int $tax_and_fee_id;

    public function toArray(): array
    {
        return [
                    'id' => $this->id ?? null,
                    'ticket_id' => $this->ticket_id ?? null,
                    'tax_and_fee_id' => $this->tax_and_fee_id ?? null,
                ];
    }

    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function setTicketId(int $ticket_id): self
    {
        $this->ticket_id = $ticket_id;
        return $this;
    }

    public function getTicketId(): int
    {
        return $this->ticket_id;
    }

    public function setTaxAndFeeId(int $tax_and_fee_id): self
    {
        $this->tax_and_fee_id = $tax_and_fee_id;
        return $this;
    }

    public function getTaxAndFeeId(): int
    {
        return $this->tax_and_fee_id;
    }
}
